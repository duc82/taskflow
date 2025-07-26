import { TaskAttachment } from "./entities/task_attachments.entity";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, In, Not, Raw } from "typeorm";
import { Task } from "./entities/tasks.entity";
import { QueryDto } from "src/dtos/query.dto";
import {
  CreateActivityDto,
  CreateLabelDto,
  CreateTaskCommentDto,
  CreateTaskDto,
  SwitchPositionTaskDto,
} from "./tasks.dto";
import { TaskComment } from "./entities/task_comments.entity";
import { TaskActivity } from "./entities/task_activities.entity";
import { UsersService } from "src/users/users.service";
import { CloudinaryService } from "src/cloudinary/cloudinary.service";
import { TaskLabel } from "./entities/task_labels.entity";
import { Column } from "src/columns/columns.entity";

@Injectable()
export class TasksService {
  private readonly taskRepository = this.dataSource.getRepository(Task);
  private readonly taskCommentRepository =
    this.dataSource.getRepository(TaskComment);
  private readonly taskAttachmentRepository =
    this.dataSource.getRepository(TaskAttachment);
  private readonly taskLabelRepository =
    this.dataSource.getRepository(TaskLabel);
  private readonly taskActivityRepository =
    this.dataSource.getRepository(TaskActivity);
  private readonly columnRepository = this.dataSource.getRepository(Column);

  constructor(
    private readonly dataSource: DataSource,
    private cloudinaryService: CloudinaryService,
    private userService: UsersService,
  ) {}

  async findAll(query: QueryDto) {
    const { search, exclude, page, limit } = query;

    const excludeIds = JSON.parse(exclude);

    if (!limit) {
      return this.taskRepository.find({
        where: {
          title: Raw((alias) => `unaccent(${alias}) ILike unaccent(:search)`, {
            search: `%${search}%`,
          }),
          id: Not(In(excludeIds)),
        },
        relations: ["userInbox", "category", "board"],
      });
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await this.taskRepository.findAndCount({
      skip,
      take: limit,
      where: {
        title: Raw((alias) => `unaccent(${alias}) ILike unaccent(:search)`, {
          search: `%${search}%`,
        }),
        id: Not(In(excludeIds)),
      },
      relations: ["userInbox", "category", "board"],
    });

    return {
      tasks,
      total,
      page,
      limit,
    };
  }

  async findAllByUserInbox(query: QueryDto, userId: string) {
    const { search, page, limit } = query;

    if (!limit) {
      return this.taskRepository.find({
        where: {
          title: Raw((alias) => `unaccent(${alias}) ILike unaccent(:search)`, {
            search: `%${search}%`,
          }),
          userInbox: { id: userId },
        },
        order: {
          position: "ASC",
        },
        relations: ["userInbox"],
      });
    }

    const skip = (page - 1) * limit;

    const [tasks, total] = await this.taskRepository.findAndCount({
      skip,
      take: limit,
      where: {
        title: Raw((alias) => `unaccent(${alias}) ILike unaccent(:search)`, {
          search: `%${search}%`,
        }),
        userInbox: {
          id: userId,
        },
      },
      order: {
        position: "ASC",
      },
      relations: ["userInbox"],
    });

    return {
      tasks,
      total,
      page,
      limit,
    };
  }

  async create(task: CreateTaskDto, userId: string) {
    const { boardId, columnId, ...otherData } = task;

    const column = await this.columnRepository.findOne({
      where: {
        id: columnId,
      },
    });

    if (!column) {
      throw new NotFoundException("Cột không tồn tại");
    }

    const positionRes = await this.taskRepository
      .createQueryBuilder("task")
      .select([
        'MAX(task.position) AS "maxPosition"',
        'MIN(task.position) AS "minPosition"',
      ])
      .getRawOne<{
        maxPosition: number | null;
        minPosition: number | null;
      }>();

    const position = columnId
      ? (positionRes?.maxPosition ?? 0) + 1000
      : positionRes.minPosition
        ? positionRes.minPosition - 0.000001
        : 1000;

    const newActivity = this.taskActivityRepository.create({
      content: `đã thêm thẻ này vào danh sách ${column.title}`,
      user: { id: userId },
    });

    const newTask = this.taskRepository.create({
      ...otherData,
      user: { id: userId },
      column: { id: columnId },
      board: boardId ? null : { id: boardId },
      userInbox: columnId ? null : { id: userId },
      position,
      members: [],
      comments: [],
      activities: [],
      labels: [],
      attachments: [],
    });

    newTask.activities.push(newActivity);

    await this.taskRepository.save(newTask);
    return newTask;
  }

  async findOne(id: string) {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["members", "comments", "activities", "labels"],
    });

    if (!task) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    return task;
  }

  // tasks.service.ts
  async switchPosition(
    id: string,
    { beforeTaskId, afterTaskId, columnId, boardId }: SwitchPositionTaskDto,
    userId: string,
  ) {
    let newPosition: number;

    if (beforeTaskId && afterTaskId) {
      const [before, after] = await Promise.all([
        this.taskRepository.findOne({
          where: {
            id: beforeTaskId,
          },
          select: ["id", "position"],
        }),
        this.taskRepository.findOne({
          where: {
            id: afterTaskId,
          },
          select: ["id", "position"],
        }),
      ]);
      newPosition = (before.position + after.position) / 2;
    } else if (beforeTaskId && !afterTaskId) {
      // Drag to last list
      const before = await this.taskRepository.findOne({
        where: {
          id: beforeTaskId,
        },
        select: ["id", "position"],
      });
      newPosition = before.position + 1000;
    } else if (!beforeTaskId && afterTaskId) {
      // Drag to first list
      const after = await this.taskRepository.findOne({
        where: {
          id: afterTaskId,
        },
        select: ["id", "position"],
      });
      newPosition = after.position / 2;
    } else {
      newPosition = 1000;
    }

    await this.taskRepository.update(id, {
      position: newPosition,
      column: columnId ? { id: columnId } : null,
      board: boardId ? { id: boardId } : null,
      userInbox: columnId ? null : { id: userId },
    });

    return {
      message: "Đổi vị trí công việc thành công",
      newPosition,
    };
  }

  async comment(body: CreateTaskCommentDto, userId: string) {
    const { taskId, ...otherData } = body;

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["comments"],
    });

    if (!task) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    const newComment = this.taskCommentRepository.create({
      ...otherData,
      user: { id: userId },
      task,
    });

    await this.taskRepository.save(newComment);

    return newComment;
  }

  async uploadAttachment(
    taskId: string,
    files: Express.Multer.File[],
    userId: string,
  ) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["attachments"],
    });

    if (!task) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    if (files.length === 0) {
      throw new BadRequestException("Không có tệp nào được tải lên");
    }

    const attachments: TaskAttachment[] = [];

    for (const file of files) {
      let resource_type: "image" | "video" | "raw" | "auto" = "auto";

      if (file.mimetype.startsWith("image/")) {
        resource_type = "image";
      } else if (file.mimetype.startsWith("video/")) {
        resource_type = "video";
      } else {
        resource_type = "raw"; // For other file types, use raw
      }

      const uploadResult = await this.cloudinaryService.uploadFile(file, {
        public_id: `tasks/attachments/${taskId}/${file.originalname}`,
        folder: "taskflow",
        resource_type,
      });
      const attachment = this.taskAttachmentRepository.create({
        url: uploadResult.secure_url,
        name: file.originalname,
        type: file.mimetype,
        user: { id: userId },
        task,
      });
      attachments.push(attachment);
    }

    task.attachments.unshift(...attachments);

    await this.taskRepository.save(task);

    return {
      message: "Tải lên tệp đính kèm thành công",
      attachments,
    };
  }

  async removeAttachment(attachmentId: string) {
    const attachment = await this.taskAttachmentRepository.findOne({
      where: {
        id: attachmentId,
      },
    });

    if (!attachment) {
      throw new NotFoundException("Tài liệu đính kèm không tồn tại");
    }

    await this.taskAttachmentRepository.softRemove(attachment);

    return {
      message: "Xóa tài liệu đính kèm thành công",
    };
  }

  async createActivity(body: CreateActivityDto, userId: string) {
    const task = await this.taskRepository.findOne({
      where: {
        id: body.taskId,
      },
      relations: ["activities"],
    });

    if (!task) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const activity = new TaskActivity();
    activity.content = body.content;
    activity.user = user;

    task.activities.push(activity);

    await task.save();

    return {
      message: "Thêm hoạt động thành công",
      activity,
    };
  }

  async createComment(body: CreateTaskCommentDto, userId: string) {
    const task = await this.taskRepository.findOne({
      where: { id: body.taskId },
      relations: ["comments"],
    });

    if (!task) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const comment = this.taskCommentRepository.create({
      ...body,
      user,
      task,
    });

    task.comments.push(comment);

    await this.taskRepository.save(task);

    return {
      message: "Thêm bình luận thành công",
      comment,
    };
  }

  async removeComment(commentId: string) {
    const comment = await this.taskCommentRepository.findOne({
      where: { id: commentId },
      relations: ["task"],
    });

    if (!comment) {
      throw new NotFoundException("Bình luận không tồn tại");
    }

    await this.taskCommentRepository.softRemove(comment);

    return {
      message: "Xóa bình luận thành công",
    };
  }

  async createLabel(body: CreateLabelDto) {
    const { taskId, ...otherData } = body;

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["labels"],
    });

    if (!task) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    const label = this.taskLabelRepository.create({
      ...otherData,
      task,
    });

    task.labels.push(label);

    await this.taskRepository.save(task);

    return {
      message: "Thêm nhãn thành công",
      label,
    };
  }

  async deleteLabel(labelId: string) {
    const label = await this.taskLabelRepository.findOne({
      where: { id: labelId },
    });

    if (!label) {
      throw new NotFoundException("Nhãn không tồn tại");
    }

    await this.taskLabelRepository.delete({
      id: labelId,
    });

    return {
      message: "Xóa nhãn thành công",
    };
  }

  async update(
    id: string,
    task: Partial<CreateTaskDto>,
    file?: Express.Multer.File,
  ) {
    const taskToUpdate = await this.findOne(id);

    Object.assign(taskToUpdate, task);

    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file, {
        public_id: `tasks/cover/${taskToUpdate.id}/${file.originalname}`,
        folder: "taskflow",
      });
      taskToUpdate.cover = uploadResult.secure_url;
    }

    await this.taskRepository.save(taskToUpdate);

    return {
      message: "Cập nhật công việc thành công",
      task: taskToUpdate,
    };
  }

  async softRemove(id: string) {
    const taskToRemove = await this.taskRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    await this.taskRepository.softRemove(taskToRemove);

    return {
      message: "Xóa công việc thành công",
    };
  }

  async restore(id: string) {
    const taskToRestore = await this.taskRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!taskToRestore) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    await this.taskRepository.restore(taskToRestore.id);

    return {
      message: "Khôi phục công việc thành công",
    };
  }

  async delete(id: string) {
    const taskToRemove = await this.findOne(id);

    await this.taskRepository.remove(taskToRemove);

    return {
      message: "Xóa công việc thành công",
    };
  }
}

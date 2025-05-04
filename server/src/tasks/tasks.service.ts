import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, ILike, In, Not } from "typeorm";
import { Task } from "./entities/tasks.entity";
import { QueryDto } from "src/dtos/query.dto";
import {
  CreateTaskCommentDto,
  CreateTaskDto,
  SwitchPositionTaskDto,
} from "./tasks.dto";
import { TaskComment } from "./entities/task_comments.entity";

@Injectable()
export class TasksService {
  private readonly tasksRepository = this.dataSouce.getRepository(Task);
  private readonly taskCommentsRepository =
    this.dataSouce.getRepository(TaskComment);

  constructor(private readonly dataSouce: DataSource) {}

  async findAll(query: QueryDto) {
    const { search, exclude, page, limit } = query;

    const excludeIds = JSON.parse(exclude);

    const skip = (page - 1) * limit;

    const [tasks, total] = await this.tasksRepository.findAndCount({
      skip,
      take: limit,
      where: {
        title: ILike(`%${search}%`),
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

    const skip = (page - 1) * limit;

    const [tasks, total] = await this.tasksRepository.findAndCount({
      skip,
      take: limit,
      where: {
        title: ILike(`%${search}%`),
        userInbox: {
          id: userId,
        },
      },
      order: {
        position: "ASC",
      },
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

    const positionRes = await this.tasksRepository
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

    const newTask = this.tasksRepository.create({
      ...otherData,
      user: { id: userId },
      column: { id: columnId },
      board: boardId ? null : { id: boardId },
      userInbox: columnId ? null : { id: userId },
      position,
    });

    await this.tasksRepository.save(newTask);
    return newTask;
  }

  async findOne(id: string) {
    const task = await this.tasksRepository.findOne({
      where: { id },
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
        this.tasksRepository.findOne({
          where: {
            id: beforeTaskId,
          },
          select: ["id", "position"],
        }),
        this.tasksRepository.findOne({
          where: {
            id: afterTaskId,
          },
          select: ["id", "position"],
        }),
      ]);
      newPosition = (before.position + after.position) / 2;
    } else if (beforeTaskId && !afterTaskId) {
      // Drag to last list
      const before = await this.tasksRepository.findOne({
        where: {
          id: beforeTaskId,
        },
        select: ["id", "position"],
      });
      newPosition = before.position + 1000;
    } else if (!beforeTaskId && afterTaskId) {
      // Drag to first list
      const after = await this.tasksRepository.findOne({
        where: {
          id: afterTaskId,
        },
        select: ["id", "position"],
      });
      newPosition = after.position / 2;
    } else {
      newPosition = 1000;
    }

    await this.tasksRepository.update(id, {
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

  // tasks.service.ts
  async comment(body: CreateTaskCommentDto, userId: string) {
    const { taskId, ...otherData } = body;

    const task = await this.tasksRepository.findOne({
      where: { id: taskId },
      relations: ["comments"],
    });

    if (!task) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    const newComment = this.taskCommentsRepository.create({
      ...otherData,
      user: { id: userId },
      task,
    });

    await this.tasksRepository.save(newComment);

    return newComment;
  }

  async update(id: string, task: Partial<CreateTaskDto>) {
    const taskToUpdate = await this.findOne(id);

    Object.assign(taskToUpdate, task);

    await this.tasksRepository.save(taskToUpdate);

    return {
      message: "Cập nhật công việc thành công",
      task: taskToUpdate,
    };
  }

  async softRemove(id: string) {
    const taskToRemove = await this.tasksRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    await this.tasksRepository.softRemove(taskToRemove);

    return {
      message: "Xóa công việc thành công",
    };
  }

  async restore(id: string) {
    const taskToRestore = await this.tasksRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!taskToRestore) {
      throw new NotFoundException("Công việc không tồn tại");
    }

    await this.tasksRepository.restore(taskToRestore.id);

    return {
      message: "Khôi phục công việc thành công",
    };
  }

  async delete(id: string) {
    const taskToRemove = await this.findOne(id);

    await this.tasksRepository.remove(taskToRemove);

    return {
      message: "Xóa công việc thành công",
    };
  }
}

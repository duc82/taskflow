import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, ILike, In, Not } from "typeorm";
import { Task } from "./entities/tasks.entity";
import { QueryDto } from "src/dtos/query.dto";
import { CreateTaskDto, SwitchPositionTaskDto } from "./tasks.dto";

@Injectable()
export class TasksService {
  private readonly tasksRepository = this.dataSouce.getRepository(Task);

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
        position: "DESC",
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

    const maxPosition = await this.tasksRepository
      .createQueryBuilder("task")
      .select("MAX(task.position)", "maxPosition")
      .getRawOne<{ maxPosition: number | null }>();

    const newTask = this.tasksRepository.create({
      ...otherData,
      user: { id: userId },
      column: { id: columnId },
      board: boardId ? null : { id: boardId },
      userInbox: columnId ? null : { id: userId },
      position: (maxPosition?.maxPosition ?? 0) + 1000,
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

  async switchPosition(
    id: string,
    { beforeTaskId, afterTaskId }: SwitchPositionTaskDto,
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
    });

    return {
      message: "Đổi vị trí công việc thành công",
      newPosition,
    };
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

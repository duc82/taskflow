import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, ILike, In, Not } from "typeorm";
import { Task } from "./entities/tasks.entity";
import { QueryDto } from "src/dtos/query.dto";
import { CreateTaskDto } from "./tasks.dto";

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
    });

    return {
      tasks,
      total,
      page,
      limit,
    };
  }

  async create(task: CreateTaskDto) {
    const newTask = this.tasksRepository.create(task);
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

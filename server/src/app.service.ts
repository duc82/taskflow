import { Injectable } from "@nestjs/common";
import { MailerService } from "./mailer/mailer.service";
import { DataSource } from "typeorm";
import { Board } from "./boards/entities/boards.entity";
import { User } from "./users/entities/users.entity";
import { Column } from "./columns/columns.entity";
import { Task } from "./tasks/entities/tasks.entity";

@Injectable()
export class AppService {
  private readonly boardRepository = this.dataSource.getRepository(Board);
  private readonly userRepository = this.dataSource.getRepository(User);
  private readonly columnRepository = this.dataSource.getRepository(Column);
  private readonly taskRepository = this.dataSource.getRepository(Task);

  constructor(
    private mailService: MailerService,
    private dataSource: DataSource,
  ) {}

  getHome(): string {
    return "API quản lý ứng dụng đánh giá hoàn thành công việc";
  }

  contact(body: { name: string; email: string; message: string }) {
    const { name, email, message } = body;
    return this.mailService.sendMail({
      to: process.env.GOOGLE_EMAIL,
      subject: `Liên hệ từ ứng dụng quản lý công việc - ${name}`,
      template: "contact",
      context: {
        name,
        email,
        message,
      },
    });
  }

  async analysis() {
    const boards = await this.boardRepository.count();
    const users = await this.userRepository.count();
    const columns = await this.columnRepository.count();
    const tasks = await this.taskRepository.count();

    return {
      boards,
      users,
      columns,
      tasks,
    };
  }
}

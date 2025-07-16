import { Module } from "@nestjs/common";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { UsersModule } from "src/users/users.module";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";

@Module({
  imports: [UsersModule, CloudinaryModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

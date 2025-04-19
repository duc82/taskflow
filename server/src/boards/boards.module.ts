import { Module } from "@nestjs/common";
import { BoardsService } from "./boards.service";
import { BoardsController } from "./boards.controller";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [UsersModule],
  providers: [BoardsService],
  controllers: [BoardsController],
})
export class BoardsModule {}

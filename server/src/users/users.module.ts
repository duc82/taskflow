import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { AvatarModule } from "src/avatar/avatar.module";
import { CloudinaryModule } from "src/cloudinary/cloudinary.module";

@Module({
  imports: [AvatarModule, CloudinaryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

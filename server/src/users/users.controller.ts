import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { QueryDto } from "src/dtos/query.dto";
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from "./users.dto";
import { CustomParseUUIDPipe } from "src/pipes/CustomParseUUIDPipe.pipe";
import { AuthGuard } from "src/guards/auth.guard";
import { Roles } from "src/decorators/roles.decorator";
import { UserRole } from "./users.enum";
import { User } from "src/decorators/user.decorator";
import { UserPayload } from "./users.interface";
import { FileInterceptor } from "@nestjs/platform-express";

@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getUsers(@Query() query: QueryDto) {
    return this.userService.findAll(query);
  }

  @Get("profile")
  async getProfile(@User() user: UserPayload) {
    return this.userService.findOne(user.userId);
  }

  @Get("search")
  async searchUsers(
    @Query("query") query: string,
    @User("userId") userId: string,
  ) {
    return this.userService.searchUsers(query, userId);
  }

  @Get(":id")
  async getUser(
    @Param("id", new CustomParseUUIDPipe())
    id: string,
  ) {
    return this.userService.findOne(id);
  }

  @Roles(UserRole.ADMIN)
  @Post("create")
  async createUser(@Body() body: CreateUserDto) {
    return {
      message: "Tạo người dùng thành công",
      user: await this.userService.create(body),
    };
  }

  @Post("update/profile")
  @UseInterceptors(FileInterceptor("avatar"))
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @User() user: UserPayload,
    @Body() body: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      message: "Cập nhật thông tin tài khoản thành công",
      user: await this.userService.update(user.userId, body, file),
    };
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @User() user: UserPayload,
    @Body() body: UpdatePasswordDto,
  ) {
    return this.userService.changePassword(user.userId, body);
  }

  @Put("update/:id")
  @UseInterceptors(FileInterceptor("avatar"))
  async updateUser(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return {
      message: "Cập nhật người dùng thành công",
      user: await this.userService.update(id, body, file),
    };
  }

  @Post("remove/multiple")
  async softRemoveMultipleUsers(@Body("ids") ids: string[]) {
    return this.userService.softRemoveMultiple(ids);
  }

  @Delete("remove/:id")
  async softRemoveUser(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.userService.remove(id);
  }

  @Put("restore/:id")
  async restoreUser(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.userService.restore(id);
  }

  @Delete("delete/:id")
  async deleteUser(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.userService.delete(id);
  }
}

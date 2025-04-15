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
  UseGuards,
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
  @HttpCode(HttpStatus.OK)
  async updateProfile(@User() user: UserPayload, @Body() body: UpdateUserDto) {
    return {
      message: "Cập nhật thông tin tài khoản thành công",
      user: await this.userService.update(user.userId, body),
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
  async updateUser(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: UpdateUserDto,
  ) {
    return {
      message: "Cập nhật người dùng thành công",
      user: await this.userService.update(id, body),
    };
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

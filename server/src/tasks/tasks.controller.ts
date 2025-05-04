import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { QueryDto } from "src/dtos/query.dto";
import { CustomParseUUIDPipe } from "src/pipes/CustomParseUUIDPipe.pipe";
import { CreateTaskDto, SwitchPositionTaskDto } from "./tasks.dto";
import { User } from "src/decorators/user.decorator";
import { AuthGuard } from "src/guards/auth.guard";

@UseGuards(AuthGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Get()
  async getAll(@Query() query: QueryDto) {
    return this.taskService.findAll(query);
  }

  @Get("inbox")
  async getAllByUserInbox(
    @Query() query: QueryDto,
    @User("userId") userId: string,
  ) {
    return this.taskService.findAllByUserInbox(query, userId);
  }

  @Get(":id")
  async getOne(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.taskService.findOne(id);
  }

  @Post("create")
  async create(@Body() body: CreateTaskDto, @User("userId") userId: string) {
    return {
      task: await this.taskService.create(body, userId),
      message: "Tạo công việc thành công",
    };
  }

  @Put("switch-position/:id")
  async switchPosition(
    @Body() body: SwitchPositionTaskDto,
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @User("userId") userId: string,
  ) {
    return this.taskService.switchPosition(id, body, userId);
  }

  @Put("update/:id")
  async update(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: Partial<CreateTaskDto>,
  ) {
    return this.taskService.update(id, body);
  }

  @Delete("remove/:id")
  async softRemove(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.taskService.softRemove(id);
  }

  @Put("restore/:id")
  async restore(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.taskService.restore(id);
  }

  @Delete("delete/:id")
  async delete(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.taskService.delete(id);
  }
}

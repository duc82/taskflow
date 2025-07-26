import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { QueryDto } from "src/dtos/query.dto";
import { CustomParseUUIDPipe } from "src/pipes/CustomParseUUIDPipe.pipe";
import {
  CreateActivityDto,
  CreateCommentDto,
  CreateLabelDto,
  CreateTaskDto,
  SwitchPositionTaskDto,
} from "./tasks.dto";
import { User } from "src/decorators/user.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

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

  @Post("activities/create")
  async createActivity(
    @Body() body: CreateActivityDto,
    @User("userId") userId: string,
  ) {
    return this.taskService.createActivity(body, userId);
  }

  @Post("comments/create")
  async createComment(
    @Body() body: CreateCommentDto,
    @User("userId") userId: string,
  ) {
    return this.taskService.createComment(body, userId);
  }

  @Delete("comments/remove/:id")
  async removeComment(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.taskService.removeComment(id);
  }

  @Post("labels/create")
  async createLabel(@Body() body: CreateLabelDto) {
    return this.taskService.createLabel(body);
  }

  @Delete("labels/delete/:id")
  async deleteLabel(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.taskService.deleteLabel(id);
  }

  @Post("attachments/upload")
  @UseInterceptors(FilesInterceptor("files"))
  async uploadAttachment(
    @Body() { taskId }: { taskId: string },
    @User("userId") userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.taskService.uploadAttachment(taskId, files, userId);
  }

  @Delete("attachments/remove/:id")
  async removeAttachment(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.taskService.removeAttachment(id);
  }

  @Put("update/:id")
  @UseInterceptors(FileInterceptor("file"))
  async update(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: Partial<CreateTaskDto>,
    @UploadedFiles() file?: Express.Multer.File,
  ) {
    return this.taskService.update(id, body, file);
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

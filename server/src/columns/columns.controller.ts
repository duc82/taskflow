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
import { QueryDto } from "src/dtos/query.dto";
import { CustomParseUUIDPipe } from "src/pipes/CustomParseUUIDPipe.pipe";
import { User } from "src/decorators/user.decorator";
import { AuthGuard } from "src/guards/auth.guard";
import {
  CreateColumnDto,
  MoveColumnDto,
  SwitchPositionColumnDto,
} from "./columns.dto";
import { ColumnsService } from "./columns.service";

@UseGuards(AuthGuard)
@Controller("columns")
export class ColumnsController {
  constructor(private readonly columnService: ColumnsService) {}

  @Get()
  async getAll(@Query() query: QueryDto) {
    return this.columnService.findAll(query);
  }

  @Get("board/:boardId")
  async getAllByBoardId(
    @Param("boardId", new CustomParseUUIDPipe()) boardId: string,
    @Query() query: QueryDto,
  ) {
    return this.columnService.findAllByBoardId(boardId, query);
  }

  @Get(":id")
  async getOne(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.columnService.findOne(id);
  }

  @Post("create")
  async create(@Body() body: CreateColumnDto, @User("userId") userId: string) {
    return {
      message: "Tạo cột thành công",
      column: await this.columnService.create(body, userId),
    };
  }

  @Put("switch-position/:id")
  async switchPosition(
    @Body() body: SwitchPositionColumnDto,
    @Param("id", new CustomParseUUIDPipe()) id: string,
  ) {
    return this.columnService.switchPosition(id, body);
  }

  @Put("move/:id")
  async moveColumn(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: MoveColumnDto,
  ) {
    return this.columnService.moveColumn(id, body);
  }

  @Put("update/:id")
  async update(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: Partial<CreateColumnDto>,
  ) {
    return {
      message: "Cập nhật cột thành công",
      column: await this.columnService.update(id, body),
    };
  }

  @Delete("remove/:id")
  async softRemove(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.columnService.softRemove(id);
  }

  @Put("restore/:id")
  async restore(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.columnService.restore(id);
  }

  @Delete("delete/:id")
  async delete(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.columnService.delete(id);
  }
}

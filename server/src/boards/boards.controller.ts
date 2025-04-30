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
import { CreateBoardDto } from "./boards.dto";
import { BoardsService } from "./boards.service";
import { QueryDto } from "src/dtos/query.dto";
import { CustomParseUUIDPipe } from "src/pipes/CustomParseUUIDPipe.pipe";
import { User } from "src/decorators/user.decorator";
import { UserPayload } from "src/users/users.interface";
import { AuthGuard } from "src/guards/auth.guard";
import { UserRole } from "src/users/users.enum";

@UseGuards(AuthGuard)
@Controller("boards")
export class BoardsController {
  constructor(private readonly boardService: BoardsService) {}

  @Post("create")
  async create(@Body() body: CreateBoardDto, @User() userPayload: UserPayload) {
    if (userPayload.role === UserRole.USER) {
      body.userId = userPayload.userId;
    }

    return {
      board: await this.boardService.create(body),
      message: "Tạo bảng thành công",
    };
  }

  @Get()
  async findAll(@Query() query: QueryDto, @User() userPayload: UserPayload) {
    return this.boardService.findAll(query, userPayload);
  }

  @Get(":id")
  async findOne(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.boardService.findOne(id);
  }

  @Put("update/:id")
  async update(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: Partial<CreateBoardDto>,
  ) {
    return this.boardService.update(id, body);
  }

  @Delete("remove/:id")
  async softRemove(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.boardService.softRemove(id);
  }

  @Put("restore/:id")
  async restore(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.boardService.restore(id);
  }

  @Delete("delete/:id")
  async delete(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.boardService.delete(id);
  }
}

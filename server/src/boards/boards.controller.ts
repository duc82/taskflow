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
import { AddMemberDto, CreateBoardDto } from "./boards.dto";
import { BoardsService } from "./boards.service";
import { QueryDto } from "src/dtos/query.dto";
import { CustomParseUUIDPipe } from "src/pipes/CustomParseUUIDPipe.pipe";
import { User } from "src/decorators/user.decorator";
import { UserPayload } from "src/users/users.interface";
import { AuthGuard } from "src/guards/auth.guard";
import { UserRole } from "src/users/users.enum";
import { MemberRole } from "./boards.enum";

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

  @Get("my-boards")
  async findMyBoards(@User("userId") userId: string) {
    return this.boardService.findAllByUserId(userId);
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

  @Post("members/add")
  async addMember(@Body() body: AddMemberDto) {
    return this.boardService.addMember(body);
  }

  @Put("members/update-role/:id")
  async updateMemberRole(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body("role") role: MemberRole,
  ) {
    return this.boardService.updateMemberRole(id, role);
  }

  @Delete("members/remove/:id")
  async removeMember(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.boardService.removeMember(id);
  }

  @Delete("remove/:id")
  async softRemove(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.boardService.softRemove(id);
  }

  @Post("remove/multiple")
  async softRemoveMultiple(@Body("ids") ids: string[]) {
    return this.boardService.softRemoveMultiple(ids);
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

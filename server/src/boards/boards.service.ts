import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, ILike, In, Not } from "typeorm";
import { Board } from "./entities/boards.entity";
import { CreateBoardDto } from "./boards.dto";
import { QueryDto } from "src/dtos/query.dto";
import { BoardMember } from "./entities/board_members.entity";
import { UserPayload } from "src/users/users.interface";
import { UserRole } from "src/users/users.enum";
import { MemberRole } from "./boards.enum";

@Injectable()
export class BoardsService {
  private readonly boardRepository = this.dataSource.getRepository(Board);

  constructor(private dataSource: DataSource) {}

  async create(body: CreateBoardDto) {
    const { userId, ...rest } = body;

    const newMember = this.dataSource.getRepository(BoardMember).create({
      role: MemberRole.ADMIN,
      user: {
        id: userId,
      },
    });

    const newBoard = this.boardRepository.create({
      ...rest,
      owner: { id: userId },
    });
    newBoard.members = [newMember];

    await this.boardRepository.save(newBoard);
    return newBoard;
  }

  async findAll(query: QueryDto, userPayload: UserPayload) {
    const { search, exclude, page, limit } = query;

    const excludeIds = JSON.parse(exclude);

    const skip = (page - 1) * limit;

    const [boards, total] = await this.boardRepository.findAndCount({
      where: {
        title: ILike(`%${search}%`),
        id: Not(In(excludeIds)),
        members:
          userPayload.role === UserRole.ADMIN
            ? {}
            : { user: { id: userPayload.userId } },
      },
      take: limit,
      skip,
    });

    return {
      boards,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: [
        "columns",
        "columns.tasks",
        "columns.tasks.column",
        "members",
        "members.user",
      ],
      order: {
        columns: {
          position: "ASC",
          tasks: {
            position: "ASC",
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException("Bảng không tồn tại");
    }

    return board;
  }

  async update(id: string, body: Partial<CreateBoardDto>) {
    const board = await this.boardRepository.findOneBy({ id });

    if (!board) {
      throw new NotFoundException("Bảng không tồn tại");
    }

    const newBoard = await this.boardRepository.update(id, body);

    return {
      message: "Cập nhật bảng thành công",
      board: newBoard,
    };
  }

  async softRemove(id: string) {
    const board = await this.boardRepository.findOneBy({ id });

    if (!board) {
      throw new NotFoundException("Bảng không tồn tại");
    }

    await this.boardRepository.softRemove(board);

    return {
      message: "Xóa bảng thành công",
    };
  }

  async restore(id: string) {
    const board = await this.boardRepository.findOneBy({ id });

    if (!board) {
      throw new NotFoundException("Bảng không tồn tại");
    }

    await this.boardRepository.restore(id);

    return {
      message: "Khôi phục bảng thành công",
    };
  }

  async delete(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!board) {
      throw new NotFoundException("Bảng không tồn tại");
    }

    await this.boardRepository.delete(id);

    return {
      message: "Xóa bảng thành công",
    };
  }
}

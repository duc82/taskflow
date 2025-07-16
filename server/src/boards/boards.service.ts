import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DataSource, In, Not, Raw } from "typeorm";
import { Board } from "./entities/boards.entity";
import { AddMemberDto, CreateBoardDto } from "./boards.dto";
import { QueryDto } from "src/dtos/query.dto";
import { BoardMember } from "./entities/board_members.entity";
import { UserPayload } from "src/users/users.interface";
import { UserRole } from "src/users/users.enum";
import { MemberRole } from "./boards.enum";
import { User } from "src/users/entities/users.entity";

@Injectable()
export class BoardsService {
  private readonly boardRepository = this.dataSource.getRepository(Board);
  private readonly boardMemberRepository =
    this.dataSource.getRepository(BoardMember);
  private readonly userRepository = this.dataSource.getRepository(User);

  constructor(private dataSource: DataSource) {}

  async create(body: CreateBoardDto) {
    const { userId, ...rest } = body;

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const newMember = this.dataSource.getRepository(BoardMember).create({
      role: MemberRole.ADMIN,
      user: {
        id: userId,
      },
    });

    const newBoard = this.boardRepository.create({
      ...rest,
      owner: user,
    });
    newBoard.members = [newMember];

    await this.boardRepository.save(newBoard);

    console.log(newBoard);
    return newBoard;
  }

  async findAll(query: QueryDto, userPayload: UserPayload) {
    const { search, exclude, page, limit } = query;

    const excludeIds = JSON.parse(exclude);

    if (!limit) {
      return this.boardRepository.find({
        where: {
          title: Raw((alias) => `unaccent(${alias}) ILike unaccent(:search)`, {
            search: `%${search}%`,
          }),
          id: Not(In(excludeIds)),
          members:
            userPayload.role === UserRole.ADMIN
              ? {}
              : { user: { id: userPayload.userId } },
        },
        relations: ["owner"],
      });
    }

    const skip = (page - 1) * limit;

    const [boards, total] = await this.boardRepository.findAndCount({
      where: {
        title: Raw((alias) => `unaccent(${alias}) ILike unaccent(:search)`, {
          search: `%${search}%`,
        }),
        id: Not(In(excludeIds)),
        members:
          userPayload.role === UserRole.ADMIN
            ? {}
            : { user: { id: userPayload.userId } },
      },
      take: limit,
      skip,
      relations: ["owner"],
    });

    return {
      boards,
      total,
      page,
      limit,
    };
  }

  async findAllByUserId(userId: string) {
    return this.boardRepository.find({
      where: {
        members: {
          user: { id: userId },
        },
      },
    });
  }

  async findOne(id: string) {
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: [
        "columns",
        "columns.tasks",
        "columns.tasks.column",
        "columns.tasks.members",
        "columns.tasks.userInbox",
        "columns.tasks.attachments",
        "columns.tasks.attachments.user",
        "columns.tasks.labels",
        "columns.tasks.activities",
        "columns.tasks.activities.user",
        "columns.tasks.comments",
        "columns.tasks.comments.user",
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
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ["owner"],
    });

    if (!board) {
      throw new NotFoundException("Bảng không tồn tại");
    }

    for (const key in body) {
      if (body[key] !== undefined) {
        board[key] = body[key];
      }
    }

    await this.boardRepository.save(board);

    return {
      message: "Cập nhật bảng thành công",
      board,
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

  async softRemoveMultiple(ids: string[]) {
    const boards = await this.boardRepository.findBy({
      id: In(ids),
    });

    if (boards.length === 0) {
      throw new NotFoundException("Không tìm thấy bảng nào để xóa");
    }

    await this.boardRepository.softRemove(boards);

    return {
      message: "Xóa bảng thành công",
    };
  }

  async addMember(body: AddMemberDto) {
    const { userId, role, boardId } = body;

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ["members", "members.user"],
    });

    if (!board) {
      throw new NotFoundException("Bảng không tồn tại");
    }

    const existingMember = board.members.find((m) => m.user.id === userId);

    if (existingMember) {
      throw new BadRequestException("Thành viên đã tồn tại trong bảng");
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const newMember = this.boardMemberRepository.create({
      role,
      user,
      board,
    });

    await this.boardMemberRepository.save(newMember);

    return {
      message: "Thêm thành viên vào bảng thành công",
      member: newMember,
    };
  }

  async removeMember(id: string) {
    const member = await this.boardMemberRepository.findOne({
      where: { id },
      relations: ["user", "board", "board.members"],
    });

    if (!member) {
      throw new NotFoundException("Thành viên không tồn tại trong bảng");
    }

    const board = member.board;

    if (member.role === MemberRole.ADMIN && board.members.length === 1) {
      throw new BadRequestException(
        "Không thể xóa thành viên quản trị duy nhất trong bảng",
      );
    }

    await this.boardMemberRepository.remove(member);

    return {
      message: "Xóa thành viên khỏi bảng thành công",
    };
  }

  async updateMemberRole(memberId: string, role: MemberRole) {
    const member = await this.boardMemberRepository.findOne({
      where: { id: memberId },
      relations: ["user", "board"],
    });

    if (!member) {
      throw new NotFoundException("Thành viên không tồn tại trong bảng");
    }

    member.role = role;

    await this.boardMemberRepository.save(member);

    return {
      message: "Cập nhật vai trò thành viên thành công",
      member,
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

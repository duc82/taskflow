import { Injectable, NotFoundException } from "@nestjs/common";
import { QueryDto } from "src/dtos/query.dto";
import { DataSource, ILike, In, Not, Raw } from "typeorm";
import { Column } from "./columns.entity";
import {
  CreateColumnDto,
  MoveColumnDto,
  SwitchPositionColumnDto,
} from "./columns.dto";

@Injectable()
export class ColumnsService {
  private readonly columnRepository = this.dataSource.getRepository(Column);

  constructor(private readonly dataSource: DataSource) {}

  async findAll(query: QueryDto) {
    const { page, limit, search, exclude } = query;

    const excludeIds = JSON.parse(exclude);

    const skip = (page - 1) * limit;

    const [columns, total] = await this.columnRepository.findAndCount({
      where: {
        title: Raw((alias) => `unaccent(${alias}) ILIKE unaccent(:search)`, {
          search: `%${search}%`,
        }),
        id: Not(In(excludeIds)),
      },
      skip,
      take: limit,
    });

    return {
      columns,
      total,
      page,
      limit,
    };
  }

  async findAllByBoardId(boardId: string, query: QueryDto) {
    const { page, limit, search, exclude } = query;

    const excludeIds = JSON.parse(exclude);

    const skip = (page - 1) * limit;

    const [columns, total] = await this.columnRepository.findAndCount({
      where: {
        title: ILike(`%${search}%`),
        id: Not(In(excludeIds)),
        board: { id: boardId },
      },
      skip,
      take: limit,
      relations: ["tasks"],
    });

    return {
      columns,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const column = await this.columnRepository.findOne({
      where: {
        id,
      },
    });

    if (!column) {
      throw new NotFoundException("cột không tồn tại");
    }

    return column;
  }

  async create(column: CreateColumnDto, userId: string) {
    const { boardId, ...rest } = column;

    const maxPosition = await this.columnRepository
      .createQueryBuilder("column")
      .select("MAX(column.position)", "maxPosition")
      .where("column.boardId = :boardId", { boardId })
      .getRawOne<{ maxPosition: number | null }>();

    const newColumn = this.columnRepository.create({
      ...rest,
      user: { id: userId },
      board: { id: boardId },
      position: (maxPosition?.maxPosition ?? 0) + 1000,
    });
    return this.columnRepository.save(newColumn);
  }

  async switchPosition(
    id: string,
    { beforeColumnId, afterColumnId, boardId }: SwitchPositionColumnDto,
  ) {
    let newPosition: number;

    if (beforeColumnId && afterColumnId) {
      const [before, after] = await Promise.all([
        this.columnRepository.findOne({
          where: {
            id: beforeColumnId,
          },
          select: ["id", "position"],
        }),
        this.columnRepository.findOne({
          where: {
            id: afterColumnId,
          },
          select: ["id", "position"],
        }),
      ]);

      const diff = Math.abs(before.position - after.position);

      // Nếu khoảng cách quá nhỏ → cần rebalance
      if (diff < 0.000001) {
        await this.rebalancePositions(boardId);

        // Query lại before/after sau khi đã rebalance
        const [newBefore, newAfter] = await Promise.all([
          this.columnRepository.findOne({
            where: {
              id: beforeColumnId,
            },
            select: ["id", "position"],
          }),
          this.columnRepository.findOne({
            where: {
              id: afterColumnId,
            },
            select: ["id", "position"],
          }),
        ]);

        newPosition = (newBefore.position + newAfter.position) / 2;
      } else {
        newPosition = (before.position + after.position) / 2;
      }
    } else if (beforeColumnId && !afterColumnId) {
      // Drag to last list
      const before = await this.columnRepository.findOne({
        where: {
          id: beforeColumnId,
        },
        select: ["id", "position"],
      });
      newPosition = before.position + 1000;
    } else if (!beforeColumnId && afterColumnId) {
      // Drag to first list
      const after = await this.columnRepository.findOne({
        where: {
          id: afterColumnId,
        },
        select: ["id", "position"],
      });
      newPosition = after.position / 2;
    } else {
      newPosition = 1000;
    }

    await this.columnRepository.update(id, {
      position: newPosition,
    });

    return {
      message: "Đổi vị trí cột thành công",
      newPosition,
    };
  }

  async moveColumn(columnId: string, body: MoveColumnDto) {
    const { beforeColumnId, afterColumnId, newBoardId } = body;

    const column = await this.columnRepository.findOne({
      where: {
        id: columnId,
      },
      relations: ["board"],
    });

    if (!column) {
      throw new NotFoundException("Cột không tồn tại");
    }

    if (column.board.id !== newBoardId) {
      column.board.id = newBoardId;
      await column.save();
    }

    await this.switchPosition(columnId, {
      beforeColumnId,
      afterColumnId,
      boardId: newBoardId,
    });

    return {
      message: "Di chuyển danh sách thành công",
    };
  }

  async cloneColumn(columnId: string, title: string, userId: string) {}

  async rebalancePositions(boardId: string) {
    const columns = await this.columnRepository.find({
      where: { board: { id: boardId } },
      order: { position: "ASC" },
      relations: ["id", "position"],
    });

    const step = 1000;

    const updatedColumns = columns.map((column, index) => ({
      id: column.id,
      position: (index + 1) * step,
    }));

    if (updatedColumns.length === 0) {
      return {
        totalUpdated: 0,
      };
    }

    const caseSql = updatedColumns
      .map((c) => `WHEN id = ${c.id} THEN ${c.position}`)
      .join(" ");

    const ids = updatedColumns.map((c) => c.id);

    await this.dataSource
      .createQueryBuilder()
      .update(Column)
      .set({
        position: () => `CASE ${caseSql} END`,
      })
      .whereInIds(ids)
      .execute();

    return {
      totalUpdated: updatedColumns.length,
    };
  }

  async update(id: string, category: Partial<CreateColumnDto>) {
    const existingColumn = await this.columnRepository.findOne({
      where: {
        id,
      },
    });

    if (!existingColumn) {
      throw new NotFoundException("Cột không tồn tại");
    }

    Object.assign(existingColumn, category);

    return await this.columnRepository.save(existingColumn);
  }

  async softRemove(id: string) {
    const column = await this.columnRepository.findOne({
      where: {
        id,
      },
    });

    if (!column) {
      throw new NotFoundException("Cột không tồn tại");
    }

    await this.columnRepository.softRemove(column);

    return {
      message: "Xóa cột thành công",
    };
  }

  async restore(id: string) {
    const column = await this.columnRepository.findOne({
      where: {
        id,
        deletedAt: Not(null),
      },
      withDeleted: true,
    });

    if (!column) {
      throw new NotFoundException("cột đã xóa không tồn tại");
    }

    await this.columnRepository.restore(column.id);

    return {
      message: "Khôi phục cột thành công",
    };
  }

  async delete(id: string) {
    const column = await this.columnRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    if (!column) {
      throw new NotFoundException("Cột không tồn tại");
    }

    await this.columnRepository.delete(column.id);

    return {
      message: "Xóa cột thành công",
    };
  }
}

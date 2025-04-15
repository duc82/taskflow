import { Injectable, NotFoundException } from "@nestjs/common";
import { QueryDto } from "src/dtos/query.dto";
import { DataSource, ILike, In, Not } from "typeorm";
import { Category } from "./categories.entity";
import { CreateCategoryDto } from "./categories.dto";

@Injectable()
export class CategoriesService {
  private readonly categoryRepository = this.dataSource.getRepository(Category);

  constructor(private readonly dataSource: DataSource) {}

  async findAll(query: QueryDto) {
    const { page, limit, search, exclude } = query;

    const excludeIds = JSON.parse(exclude);

    const skip = (page - 1) * limit;

    const [categories, total] = await this.categoryRepository.findAndCount({
      where: {
        name: ILike(`%${search}%`),
        id: Not(In(excludeIds)),
      },
      skip,
      take: limit,
    });

    return {
      categories,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    return category;
  }

  async create(category: CreateCategoryDto) {
    const newCategory = this.categoryRepository.create(category);
    return await this.categoryRepository.save(newCategory);
  }

  async update(id: string, category: Partial<CreateCategoryDto>) {
    const existingCategory = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!existingCategory) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    Object.assign(existingCategory, category);

    return await this.categoryRepository.save(existingCategory);
  }

  async softRemove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    await this.categoryRepository.remove(category);

    return {
      message: "Xóa danh mục thành công",
    };
  }

  async restore(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        deletedAt: Not(null),
      },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException("Danh mục đã xóa không tồn tại");
    }

    await this.categoryRepository.restore(category.id);

    return {
      message: "Khôi phục danh mục thành công",
    };
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
      },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException("Danh mục không tồn tại");
    }

    await this.categoryRepository.delete(category.id);

    return {
      message: "Xóa danh mục thành công",
    };
  }
}

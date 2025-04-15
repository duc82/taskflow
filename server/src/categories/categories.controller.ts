import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { QueryDto } from "src/dtos/query.dto";
import { CustomParseUUIDPipe } from "src/pipes/CustomParseUUIDPipe.pipe";
import { CreateCategoryDto } from "./categories.dto";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly categorieService: CategoriesService) {}

  @Get()
  async getAll(@Query() query: QueryDto) {
    return this.categorieService.findAll(query);
  }

  @Get(":id")
  async getOne(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.categorieService.findOne(id);
  }

  @Post("create")
  async create(@Body() body: CreateCategoryDto) {
    return {
      message: "Tạo danh mục thành công",
      category: await this.categorieService.create(body),
    };
  }

  @Put(":id")
  async update(
    @Param("id", new CustomParseUUIDPipe()) id: string,
    @Body() body: Partial<CreateCategoryDto>,
  ) {
    return {
      message: "Cập nhật danh mục thành công",
      category: await this.categorieService.update(id, body),
    };
  }

  @Delete("remove/:id")
  async softRemove(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.categorieService.softRemove(id);
  }

  @Put("restore/:id")
  async restore(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.categorieService.restore(id);
  }

  @Delete("delete/:id")
  async delete(@Param("id", new CustomParseUUIDPipe()) id: string) {
    return this.categorieService.delete(id);
  }
}

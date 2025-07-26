import { IntersectionType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsJSON, IsOptional, IsString } from "class-validator";

export class SearchDto {
  @IsOptional()
  @IsString()
  search: string = "";

  @IsOptional()
  @IsJSON()
  exclude: string = "[]";
}

export class PaginationLimitDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  limit: number;
}

export class QueryDto extends IntersectionType(SearchDto, PaginationLimitDto) {}

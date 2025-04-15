import { IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class CreateCategoryDto {
  @IsNotEmpty({
    message: "Tên danh mục không được để trống",
  })
  name: string;

  @ValidateIf((o) => !o.description)
  @IsString()
  description?: string;

  @IsNotEmpty({
    message: "Người dùng không được để trống",
  })
  userId: string;
}

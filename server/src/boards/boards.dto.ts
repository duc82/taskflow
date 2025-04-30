import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from "class-validator";
import { BoardVisibility } from "./boards.enum";

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({
    message: "Vui lòng nhập tên bảng",
  })
  title: string;

  @ValidateIf((o) => o.cover)
  @IsString()
  cover?: string;

  @ValidateIf((o) => o.coverColor)
  @IsString()
  coverColor?: string;

  @IsEnum(BoardVisibility)
  visibility: BoardVisibility;

  @ValidateIf((o) => o.userId)
  @IsUUID(4, {
    message: "User ID không hợp lệ",
  })
  userId?: string;
}

import { IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";

export class CreateColumnDto {
  @IsNotEmpty({
    message: "Tên danh mục không được để trống",
  })
  @IsString()
  title: string;

  @ValidateIf((o) => o.description)
  @IsString()
  description?: string;

  @IsUUID(4, {
    message: "Board ID không hợp lệ",
  })
  boardId: string;
}

export class SwitchPositionColumnDto {
  @ValidateIf((o) => o.beforeColumnId)
  @IsUUID(4)
  beforeColumnId?: string;

  @ValidateIf((o) => o.afterColumnId)
  @IsUUID(4)
  afterColumnId?: string;

  @IsUUID(4, {
    message: "Board ID không hợp lệ",
  })
  boardId: string;
}

export class MoveColumnDto {
  @IsUUID(4, {
    message: "Board ID không hợp lệ",
  })
  newBoardId: string;

  @ValidateIf((o) => o.beforeColumnId)
  @IsUUID(4)
  beforeColumnId?: string;

  @ValidateIf((o) => o.afterColumnId)
  @IsUUID(4)
  afterColumnId?: string;
}

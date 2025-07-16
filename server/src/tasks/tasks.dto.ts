import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from "class-validator";

export class CreateTaskDto {
  @IsNotEmpty({
    message: "Tên công việc không được để trống",
  })
  title: string;

  @ValidateIf((o) => o.description)
  @IsString()
  description?: string;

  @IsBoolean({
    message: "Trạng thái hoàn thành không hợp lệ",
  })
  isCompleted: boolean;

  @IsBoolean({
    message: "Trạng thái theo dõi không hợp lệ",
  })
  isWatching: boolean;

  @ValidateIf((o) => o.cover)
  @IsString()
  cover?: string;

  @ValidateIf((o) => o.coverColor)
  @IsString()
  coverColor?: string;

  @ValidateIf((o) => o.startDate)
  @IsDateString(
    {},
    {
      message: "Ngày bắt đầu không hợp lệ",
    },
  )
  startDate?: Date;

  @ValidateIf((o) => o.dueDate)
  @IsDateString(
    {},
    {
      message: "Ngày hết hạn không hợp lệ",
    },
  )
  dueDate?: Date;

  @ValidateIf((o) => o.columnId)
  @IsUUID(4, {
    message: "Column ID không hợp lệ",
  })
  columnId?: string;

  @ValidateIf((o) => o.boardId)
  @IsUUID(4, {
    message: "Board ID không hợp lệ",
  })
  boardId?: string;
}

export class SwitchPositionTaskDto {
  @ValidateIf((o) => o.beforeTaskId)
  @IsUUID(4)
  beforeTaskId?: string;

  @ValidateIf((o) => o.afterTaskId)
  @IsUUID(4)
  afterTaskId?: string;

  @ValidateIf((o) => o.columnId)
  @IsUUID(4)
  columnId?: string;

  @ValidateIf((o) => o.boardId)
  @IsUUID(4)
  boardId?: string;
}

export class CreateTaskCommentDto {
  @IsNotEmpty({
    message: "Nội dung không được để trống",
  })
  content: string;

  @IsUUID(4, {
    message: "Task ID không hợp lệ",
  })
  taskId: string;
}

export class CreateActivityDto {
  @IsNotEmpty({
    message: "Nội dung hoạt động không được để trống",
  })
  content: string;

  @IsUUID(4, {
    message: "Task ID không hợp lệ",
  })
  taskId: string;
}

export class CreateCommentDto {
  @IsNotEmpty({
    message: "Nội dung bình luận không được để trống",
  })
  content: string;

  @IsUUID(4, {
    message: "Task ID không hợp lệ",
  })
  taskId: string;
}

export class CreateLabelDto {
  @IsNotEmpty({
    message: "Tên nhãn không được để trống",
  })
  name: string;

  @IsNotEmpty({
    message: "Màu sắc nhãn không được để trống",
  })
  color: string;

  @IsUUID(4, {
    message: "Task ID không hợp lệ",
  })
  taskId: string;
}

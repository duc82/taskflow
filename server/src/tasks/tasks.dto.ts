import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from "class-validator";
import { TaskStatus } from "./tasks.enum";

export class CreateTaskDto {
  @IsNotEmpty({
    message: "Tên công việc không được để trống",
  })
  title: string;

  @IsString()
  description: string;

  @IsNotEmpty({
    message: "Ngày hết hạn không được để trống",
  })
  @IsDateString(
    {},
    {
      message: "Ngày hết hạn không hợp lệ",
    },
  )
  dueDate: Date;

  @IsNotEmpty({
    message: "Trạng thái không được để trống",
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsNotEmpty({
    message: "Tiến độ không được để trống",
  })
  progress: number;

  @IsNotEmpty({
    message: "Người dùng không được để trống",
  })
  userId: string;

  @IsNotEmpty({
    message: "Danh mục không được để trống",
  })
  categoryId: string;

  @ValidateIf((o) => !o.organizationId)
  @IsString()
  organizationId?: string;
}

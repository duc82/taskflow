import { IsEmail, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({
    message: "Vui lòng nhập tên",
  })
  name: string;

  @IsEmail(
    {},
    {
      message: "Email không hợp lệ",
    },
  )
  email: string;

  @IsNotEmpty({
    message: "Vui lòng nhập mật khẩu",
  })
  password: string;
}

export class UpdateUserDto {
  @ValidateIf((o) => o.name)
  @IsString()
  name?: string;

  @ValidateIf((o) => o.email)
  @IsEmail(
    {},
    {
      message: "Email không hợp lệ",
    },
  )
  email?: string;

  @ValidateIf((o) => o.password)
  @IsString()
  password?: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty({
    message: "Vui lòng nhập mật khẩu cũ",
  })
  @IsString()
  password: string;

  @IsNotEmpty({
    message: "Vui lòng nhập mật khẩu mới",
  })
  @IsString()
  newPassword: string;
}

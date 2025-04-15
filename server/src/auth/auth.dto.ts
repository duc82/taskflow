import { OmitType } from "@nestjs/swagger";
import { CreateUserDto } from "src/users/users.dto";

export class SignUpDto extends CreateUserDto {}

export class SignInDto extends OmitType(CreateUserDto, ["name"]) {}

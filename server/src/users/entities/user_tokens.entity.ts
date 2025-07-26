import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({
  name: "user_tokens",
})
export class UserToken extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    nullable: true,
  })
  resetToken: string;

  @Column({
    nullable: true,
    type: "timestamptz",
  })
  resetTokenExpires: Date;
}

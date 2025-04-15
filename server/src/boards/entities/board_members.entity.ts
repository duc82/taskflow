import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MemberRole } from "../boards.enum";
import { User } from "src/users/entities/users.entity";
import { Board } from "./boards.entity";

@Entity("board_members")
export class BoardMember extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.boardMembers, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Board, (board) => board.members, { onDelete: "CASCADE" })
  board: Board;

  @Column({ type: "enum", enum: MemberRole, default: MemberRole.MEMBER })
  role: MemberRole;
}

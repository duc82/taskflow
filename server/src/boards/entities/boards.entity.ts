import {
  BaseEntity,
  Column as ColumnTypeorm,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BoardVisibility } from "../boards.enum";
import { Task } from "src/tasks/entities/tasks.entity";
import { BoardMember } from "./board_members.entity";
import { User } from "src/users/entities/users.entity";
import { Column } from "src/columns/columns.entity";
import { TaskLabel } from "src/tasks/entities/task_labels.entity";

@Entity("boards")
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ColumnTypeorm()
  title: string;

  @ColumnTypeorm({
    nullable: true,
    default: "rgb(220, 234, 254)",
  })
  cover: string;

  @ColumnTypeorm({
    nullable: true,
  })
  coverColor: string;

  @ColumnTypeorm({
    type: "enum",
    enum: BoardVisibility,
    default: BoardVisibility.PRIVATE,
  })
  visibility: BoardVisibility;

  @ManyToOne(() => User, (user) => user.boards, {
    onDelete: "CASCADE",
  })
  owner: User;

  @OneToMany(() => Task, (task) => task.board, {
    cascade: true,
  })
  tasks: Task[];

  @OneToMany(() => BoardMember, (boardMember) => boardMember.board, {
    cascade: true,
  })
  members: BoardMember[];

  @OneToMany(() => Column, (column) => column.board, {
    cascade: true,
  })
  columns: Column[];

  @DeleteDateColumn({
    type: "timestamptz",
    name: "deletedAt",
  })
  deletedAt: Date;

  @CreateDateColumn({
    type: "timestamptz",
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamptz",
  })
  updatedAt: Date;
}

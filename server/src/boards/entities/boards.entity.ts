import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { BoardVisibility } from "../boards.enum";
import { Task } from "src/tasks/entities/tasks.entity";
import { BoardMember } from "./board_members.entity";

@Entity("boards")
export class Board extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({
    nullable: true,
  })
  cover: string;

  @Column({
    nullable: true,
  })
  coverColor: string;

  @Column({
    type: "enum",
    enum: BoardVisibility,
    default: BoardVisibility.WORKSPACE,
  })
  visibility: BoardVisibility;

  @OneToMany(() => Task, (task) => task.board, {
    cascade: true,
  })
  tasks: Task[];

  @OneToMany(() => BoardMember, (boardMember) => boardMember.board, {
    cascade: true,
  })
  members: BoardMember[];

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

import { User } from "src/users/entities/users.entity";
import {
  BaseEntity,
  Column as ColumnTypeorm,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { TaskComment } from "./task_comments.entity";
import { Board } from "src/boards/entities/boards.entity";
import { TaskAttachment } from "./task_attachments.entity";
import { TaskActivity } from "./task_activities.entity";
import { TaskLabel } from "./task_labels.entity";
import { Column } from "src/columns/columns.entity";

@Entity("tasks")
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ColumnTypeorm()
  title: string;

  @ColumnTypeorm({
    type: "double precision",
  })
  position: number;

  @ColumnTypeorm({ type: "text", nullable: true })
  description: string;

  @ColumnTypeorm({
    nullable: true,
  })
  cover: string;

  @ColumnTypeorm({
    nullable: true,
  })
  coverColor: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Column, (column) => column.tasks, {
    nullable: true,
    onDelete: "CASCADE",
  })
  column: Column;

  @OneToMany(() => TaskComment, (taskComment) => taskComment.task, {
    cascade: true,
  })
  comments: TaskComment[];

  @OneToMany(() => TaskLabel, (taskLabel) => taskLabel.task, {
    cascade: true,
  })
  labels: TaskLabel[];

  @OneToMany(() => TaskAttachment, (taskAttachment) => taskAttachment.task, {
    cascade: true,
  })
  attachments: TaskAttachment[];

  @OneToMany(() => TaskActivity, (taskActivity) => taskActivity.task, {
    cascade: true,
  })
  activities: TaskActivity[];

  @ManyToOne(() => Board, (board) => board.tasks, {
    onDelete: "CASCADE",
  })
  board: Board;

  @ManyToOne(() => User, (user) => user.inboxes, {
    onDelete: "CASCADE",
  })
  userInbox: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: "task_members",
    joinColumn: {
      name: "taskId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "userId",
      referencedColumnName: "id",
    },
  })
  members: User[];

  @ColumnTypeorm({
    type: "timestamptz",
    nullable: true,
  })
  completedAt: Date;

  @ColumnTypeorm({ type: "timestamptz", nullable: true })
  startDate: Date;

  @ColumnTypeorm({ type: "timestamptz", nullable: true })
  dueDate: Date;

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

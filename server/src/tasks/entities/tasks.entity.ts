import { User } from "src/users/entities/users.entity";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "src/categories/categories.entity";
import { TaskComment } from "./task_comments.entity";
import { Board } from "src/boards/entities/boards.entity";
import { TaskAttachment } from "./task_attachments.entity";
import { TaskActivity } from "./task_activities.entity";
import { TaskLabel } from "./task_labels.entity";
import { Archive } from "src/archives/archives.entity";

@Entity("tasks")
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "boolean",
    default: false,
  })
  isCompleted: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  isWatching: boolean;

  @Column({
    nullable: true,
  })
  cover: string;

  @Column({
    nullable: true,
  })
  coverColor: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Category, (category) => category.tasks, {
    nullable: true,
    onDelete: "CASCADE",
  })
  category: Category;

  @ManyToOne(() => Archive, (archive) => archive.tasks, {
    onDelete: "CASCADE",
  })
  archive: Archive;

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

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
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

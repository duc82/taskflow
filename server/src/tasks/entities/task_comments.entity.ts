import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Task } from "./tasks.entity";
import { User } from "src/users/entities/users.entity";

@Entity("task_comments")
export class TaskComment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: "CASCADE" })
  task: Task;

  @ManyToOne(() => User, (user) => user.taskComments, { onDelete: "CASCADE" })
  user: User;

  @Column({ type: "text" })
  content: string;

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

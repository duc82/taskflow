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

@Entity("task_attachments")
export class TaskAttachment extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  url: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  type: string;

  @ManyToOne(() => Task, (task) => task.attachments, {
    onDelete: "CASCADE",
  })
  task: Task;

  @ManyToOne(() => User, (user) => user.taskAttachments, {
    onDelete: "CASCADE",
  })
  user: User;

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

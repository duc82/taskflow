import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task } from "./tasks.entity";

@Entity("task_labels")
export class TaskLabel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToOne(() => Task, (task) => task.labels, { onDelete: "CASCADE" })
  task: Task;
}

import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task } from "./tasks.entity";
import { Board } from "../../boards/entities/boards.entity";

@Entity("task_labels")
export class TaskLabel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  color: string;

  @ManyToOne(() => Task, (task) => task.labels)
  task: Task;
}

import { Task } from "src/tasks/entities/tasks.entity";
import { BaseEntity, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("archives")
export class Archive extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @OneToMany(() => Task, (task) => task.archive, {
    cascade: true,
  })
  tasks: Task[];
}

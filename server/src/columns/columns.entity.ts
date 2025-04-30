import { Board } from "src/boards/entities/boards.entity";
import { Task } from "src/tasks/entities/tasks.entity";
import { User } from "src/users/entities/users.entity";
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

@Entity("columns")
export class Column extends BaseEntity {
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

  @ManyToOne(() => User, (user) => user.columns, { onDelete: "CASCADE" })
  user: User;

  @ManyToOne(() => Board, (board) => board.columns, { onDelete: "CASCADE" })
  board: Board;

  @OneToMany(() => Task, (task) => task.column)
  tasks: Task[];

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

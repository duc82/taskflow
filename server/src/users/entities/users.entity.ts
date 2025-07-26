import { Exclude } from "class-transformer";
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column as ColumnTypeorm,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "../users.enum";
import { Task } from "src/tasks/entities/tasks.entity";
import { TaskComment } from "src/tasks/entities/task_comments.entity";
import { UserToken } from "./user_tokens.entity";
import * as bcrypt from "bcrypt";
import { BoardMember } from "src/boards/entities/board_members.entity";
import { TaskActivity } from "src/tasks/entities/task_activities.entity";
import { Board } from "src/boards/entities/boards.entity";
import { Column } from "src/columns/columns.entity";
import { TaskAttachment } from "src/tasks/entities/task_attachments.entity";

@Entity("users")
export class User extends BaseEntity {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index("idx_users_email", { unique: true })
  @ColumnTypeorm()
  email: string;

  @ColumnTypeorm()
  name: string;

  @ColumnTypeorm()
  avatar: string;

  @ColumnTypeorm()
  @Exclude()
  password: string;

  @ColumnTypeorm({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Column, (column) => column.user)
  columns: Column[];

  @OneToMany(() => TaskComment, (taskComment) => taskComment.user)
  taskComments: TaskComment[];

  @OneToOne(() => UserToken, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  token: UserToken;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.user)
  boardMembers: BoardMember[];

  @OneToMany(() => TaskActivity, (taskActivity) => taskActivity.user)
  taskActivities: TaskActivity[];

  @OneToMany(() => Task, (task) => task.userInbox)
  inboxes: Task[];

  @OneToMany(() => Board, (board) => board.owner)
  boards: Board[];

  @OneToMany(() => TaskAttachment, (task) => task.user)
  taskAttachments: TaskAttachment[];

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (!this.password) {
      return;
    }
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}

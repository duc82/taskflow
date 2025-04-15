import { Exclude } from "class-transformer";
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
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
import { Category } from "src/categories/categories.entity";
import { TaskComment } from "src/tasks/entities/task_comments.entity";
import { UserToken } from "./user_tokens.entity";
import * as bcrypt from "bcrypt";
import { BoardMember } from "src/boards/entities/board_members.entity";
import { TaskActivity } from "src/tasks/entities/task_activities.entity";

@Entity("users")
export class User extends BaseEntity {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index("idx_users_email", { unique: true })
  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  avatar: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Task, (task) => task.user, {
    cascade: true,
  })
  tasks: Task[];

  @OneToMany(() => Category, (category) => category.user, {
    cascade: true,
  })
  categories: Category[];

  @OneToMany(() => TaskComment, (taskComment) => taskComment.user, {
    cascade: true,
  })
  taskComments: TaskComment[];

  @OneToOne(() => UserToken, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  token: UserToken;

  @OneToMany(() => BoardMember, (boardMember) => boardMember.user)
  boardMembers: BoardMember[];

  @OneToMany(() => TaskActivity, (taskActivity) => taskActivity.user, {
    cascade: true,
  })
  taskActivities: TaskActivity[];

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

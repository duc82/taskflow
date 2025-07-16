import { Column } from "./column";
import { User } from "./user";

export interface Attachment {
  id: string;
  url: string;
  name: string;
  type: string;
  user: User;
  task: Task;
  createdAt: string | Date;
}

export interface Activity {
  id: string;
  content: string;
  user: User;
  task: Task;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export interface Comment {
  id: string;
  content: string;
  user: User;
  task: Task;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  cover: string | null;
  coverColor: string | null;
  position: number;
  members: User[];
  column: Column | null;
  userInbox: User | null;
  completedAt: string | Date | null;
  attachments: Attachment[];
  activities: Activity[];
  comments: Comment[];
  labels: Label[];
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TasksReponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export interface TaskReponse {
  task: Task;
  message: string;
}

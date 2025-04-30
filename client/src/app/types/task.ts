import { Column } from "./column";

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isWatching: boolean;
  cover: string | null;
  coverColor: string | null;
  position: number;
  column: Column | null;
  startDate: string;
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

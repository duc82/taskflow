import { Task } from "./task";

export interface Column {
  id: string;
  title: string;
  description?: string;
  tasks: Task[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ColumnResponse {
  column: Column;
  message: string;
}

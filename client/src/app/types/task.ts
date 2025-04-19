export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  isWatching: boolean;
  cover: string | null;
  coverColor: string | null;
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

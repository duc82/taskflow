import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().nonempty("Tên công việc không được để trống"),
  description: z.string().optional(),
  isCompleted: z.boolean(),
  isWatching: z.boolean(),
  cover: z.string().optional(),
  coverColor: z.string().optional(),
  startDate: z.date().optional(),
  dueDate: z.date().optional(),
  columnId: z.string().optional(),
  boardId: z.string().optional(),
});

export type TaskDto = z.infer<typeof taskSchema>;

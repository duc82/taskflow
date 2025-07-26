import { z } from "zod";

export const columnSchema = z.object({
  title: z.string().nonempty(),
  boardId: z.string().nonempty(),
});

export type ColumnDto = z.infer<typeof columnSchema>;

import { z } from "zod";

export const boardSchema = z.object({
  title: z.string().nonempty("Tên bảng không được để trống"),
  cover: z.string().optional(),
  coverColor: z.string().optional(),
  visibility: z.enum(["private", "public"], {
    error: "Quyền xem không hợp lệ",
  }),
});

export type BoardDto = z.infer<typeof boardSchema>;

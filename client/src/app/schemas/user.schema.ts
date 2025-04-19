import { z } from "zod";

const password = z.string().nonempty("Mật khẩu không được để trống");

export const userSchema = z.object({
  email: z
    .string()
    .email("Email không hợp lệ")
    .nonempty("Email không được để trống"),
  name: z.string().nonempty("Tên không được để trống"),
  avatar: z
    .any()
    .optional()
    .refine((file) => file?.length === 1, "Vui lòng chọn ảnh đại diện"),
});

export const updatePasswordSchema = z
  .object({
    password: password,
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type UserDto = z.infer<typeof userSchema>;
export type UpdatePasswordDto = z.infer<typeof updatePasswordSchema>;

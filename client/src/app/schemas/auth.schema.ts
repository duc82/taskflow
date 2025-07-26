import { z } from "zod";

const email = z
  .string()
  .email("Email không hợp lệ")
  .nonempty("Email không được để trống");

const password = z.string().nonempty("Mật khẩu không được để trống");

export const signInSchema = z.object({
  email,
  password,
});

export const signUpSchema = z
  .object({
    name: z.string().nonempty("Tên không được để trống"),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export type SignInDto = z.infer<typeof signInSchema>;
export type SignUpDto = z.infer<typeof signUpSchema>;

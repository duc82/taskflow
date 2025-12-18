"use client";
import Image from "next/image";
import logo from "@/app/assets/taskflow2.png";
import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { useForm } from "react-hook-form";
import { SignInDto, signInSchema } from "@/app/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { signIn as signInClient } from "@/app/services/auth.service";
import Spinner from "@/app/components/Spinner";
import { useState } from "react";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInDto>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });
  const [errorServer, setErrorServer] = useState<string>("");

  const onSubmit = async (data: SignInDto) => {
    try {
      const result = await signInClient(data.email, data.password);
      await signIn("credentials", {
        ...result.user,
        accessToken: result.accessToken,
        redirect: true,
        redirectTo: "/cong-viec",
      });
    } catch (error) {
      if (error instanceof Error) {
        setErrorServer(error.message);
      } else {
        setErrorServer("Đã xảy ra lỗi không xác định");
      }
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image
          src={logo}
          alt="Logo"
          width={0}
          height={0}
          sizes="100vw"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 mb-2">
          Đăng nhập vào tài khoản của bạn
        </h2>
        <p className="text-center">
          Email: <span className="text-gray-600">example@gmail.com</span> | Mật
          khẩu: <span className="text-gray-600">12345</span>{" "}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {errorServer && (
          <div className="mb-4 rounded-md bg-red-50 p-3" role="alert">
            <div className="flex items-center">
              <XCircleIcon
                className="size-5 shrink-0 text-red-400"
                aria-hidden="true"
              />
              <div className="ml-2">
                <p className="text-sm font-medium text-red-800">
                  {errorServer}
                </p>
              </div>
            </div>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                type="email"
                {...register("email")}
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Mật khẩu
              </label>
              <div className="text-sm">
                <Link
                  href="#"
                  className="font-semibold text-blue-600 hover:text-blue-500"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                type="password"
                {...register("password")}
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full cursor-pointer justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {isSubmitting ? <Spinner /> : "Đăng nhập"}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Chưa có tài khoản?{" "}
          <Link
            href="/dang-ky"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

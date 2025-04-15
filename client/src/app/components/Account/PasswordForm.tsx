"use client";

import fetchAuth from "@/app/libs/fetchAuth";
import {
  UpdatePasswordDto,
  updatePasswordSchema,
} from "@/app/schemas/user.schema";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Spinner from "../Spinner";

export default function PasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordDto>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
  });
  const [errorServer, setErrorServer] = useState<string>("");

  const onSubmit = async (data: UpdatePasswordDto) => {
    try {
      const result = await fetchAuth<{ message: string }>(
        "/users/change-password",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      toast.success(result.message);
      reset();
    } catch (error) {
      if (error instanceof Error) {
        setErrorServer(error.message);
      } else {
        setErrorServer("Đã xảy ra lỗi không xác định");
      }
    }
  };

  return (
    <form className="pt-4" onSubmit={handleSubmit(onSubmit)}>
      {errorServer && (
        <div className="mb-4 rounded-md bg-red-50 p-3" role="alert">
          <div className="flex items-center">
            <XCircleIcon
              className="size-5 flex-shrink-0 text-red-400"
              aria-hidden="true"
            />
            <div className="ml-2">
              <p className="text-sm font-medium text-red-800">{errorServer}</p>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div>
          <label
            htmlFor="password"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Mật khẩu hiện tại
          </label>
          <div className="mt-2">
            <input
              id="password"
              type="password"
              {...register("password")}
              required
              autoComplete="none"
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
          <label
            htmlFor="newPassword"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Mật khẩu mới
          </label>
          <div className="mt-2">
            <input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              required
              autoComplete="none"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
            />
          </div>
          {errors.newPassword && (
            <p className="mt-2 text-sm text-red-600">
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Xác nhận mật khẩu mới
          </label>
          <div className="mt-2">
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              required
              autoComplete="none"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex cursor-pointer justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isSubmitting ? <Spinner /> : "Đổi mật khẩu"}
          </button>
        </div>
      </div>
    </form>
  );
}

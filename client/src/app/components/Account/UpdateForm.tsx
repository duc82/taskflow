"use client";

import { UserDto, userSchema } from "@/app/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Spinner from "../Spinner";
import { User, UserReponse } from "@/app/types/user";
import { XCircleIcon } from "@heroicons/react/24/solid";
import fetchAuth from "@/app/libs/fetchAuth";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function UpdateForm({ user }: { user: User }) {
  const { update } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserDto>({
    resolver: zodResolver(userSchema),
    mode: "onChange",
    defaultValues: {
      email: user.email,
      name: user.name,
    },
  });
  const [errorServer, setErrorServer] = useState<string>("");

  const onSubmit = async (data: UserDto) => {
    try {
      const result = await fetchAuth<UserReponse>("/users/update/profile", {
        method: "POST",
        body: JSON.stringify(data),
      });
      await update(result.user);
      toast.success(result.message);
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
              autoComplete="none"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Tên
          </label>
          <div className="mt-2">
            <input
              id="name"
              type="name"
              {...register("name")}
              required
              autoComplete="none"
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="role"
            className="block text-sm/6 font-medium text-gray-900"
          >
            Vai trò
          </label>
          <div className="mt-2">
            <input
              id="role"
              type="role"
              autoComplete="none"
              defaultValue={user.role}
              disabled
              className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex cursor-pointer justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {isSubmitting ? <Spinner /> : "Lưu"}
          </button>
        </div>
      </div>
    </form>
  );
}

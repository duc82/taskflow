"use client";

import { UserDto, userSchema } from "@/app/schemas/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import Spinner from "../Spinner";
import { User, UserReponse } from "@/app/types/user";
import { ArrowUpTrayIcon, XCircleIcon } from "@heroicons/react/24/solid";
import fetchAuth from "@/app/libs/fetchAuth";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function UpdateForm({ user }: { user: User }) {
  const { update } = useSession();
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);

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
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("name", data.name);
      formData.append("avatar", data.avatar[0]);

      const result = await fetchAuth<UserReponse>("/users/update/profile", {
        method: "POST",
        body: formData,
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
        <div className="flex items-center">
          <Image
            src={filePreview?.preview || user.avatar}
            alt={user.name}
            width={64}
            height={64}
            className="rounded-full object-cover w-16 h-16"
            onLoad={() => {
              if (filePreview) {
                URL.revokeObjectURL(filePreview.preview);
              }
            }}
          />
          <label
            htmlFor="avatar"
            className="flex items-center space-x-1 ml-3 cursor-pointer bg-blue-600 text-white px-3 py-1.5 font-semibold shadow-xs text-sm/4 rounded-md hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ArrowUpTrayIcon className="size-5" />
            <span>Tải lên</span>
            <input
              type="file"
              id="avatar"
              {...register("avatar", {
                onChange(event: ChangeEvent<HTMLInputElement>) {
                  const files = event.target.files;
                  if (files) {
                    const preview = URL.createObjectURL(files[0]);
                    setFilePreview({
                      ...files[0],
                      preview,
                    });
                  }
                },
              })}
              multiple={false}
              accept="image/*"
              hidden
            />
          </label>
        </div>
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
              readOnly
              disabled
              className="block read-only:bg-gray-100 w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
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

"use client";
import Image from "next/image";
import logo from "@/app/assets/taskflow2.png";
import Link from "next/link";
import { signUp } from "@/app/actions/auth.action";
import { useActionState } from "react";
import { XCircleIcon } from "@heroicons/react/24/solid";

const initialState = {
  error: null,
};

export default function Register() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

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
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Đăng ký tài khoản
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {state.error && (
          <div className="mb-4 rounded-md bg-red-50 p-3" role="alert">
            <div className="flex items-center">
              <XCircleIcon
                className="size-5 flex-shrink-0 text-red-400"
                aria-hidden="true"
              />
              <div className="ml-2">
                <p className="text-sm font-medium text-red-800">
                  {state.error}
                </p>
              </div>
            </div>
          </div>
        )}
        <form action={formAction}>
          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Tên
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Mật khẩu
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </div>
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm/6 font-medium text-gray-900"
            >
              Nhập lại mật khẩu
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="confirm-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={pending}
              className="flex w-full justify-center cursor-pointer rounded-md bg-blue-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Đăng ký
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm/6 text-gray-500">
          Đã có tài khoản?{" "}
          <Link
            href="/dang-nhap"
            className="font-semibold text-blue-600 hover:text-blue-500"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

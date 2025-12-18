"use client";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  Bars3Icon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import logo from "@/app/assets/taskflow.png";
import useScroll from "../hooks/useScroll";
import clsx from "clsx";
import {
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { removeRefreshToken } from "../actions/auth.action";
import dynamic from "next/dynamic";

const Menu = dynamic(
  () => import("@headlessui/react").then((mod) => mod.Menu),
  {
    ssr: false,
  },
);
const MenuButton = dynamic(
  () => import("@headlessui/react").then((mod) => mod.MenuButton),
  {
    ssr: false,
  },
);
const MenuItem = dynamic(
  () => import("@headlessui/react").then((mod) => mod.MenuItem),
  {
    ssr: false,
  },
);
const MenuItems = dynamic(
  () => import("@headlessui/react").then((mod) => mod.MenuItems),
  {
    ssr: false,
  },
);

export default function Header({ session }: { session: Session | null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { y } = useScroll();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await Promise.all([
      removeRefreshToken(),
      signOut({
        redirect: true,
        redirectTo: "/dang-nhap",
      }),
    ]);
  };

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 w-full text-white py-4 z-30 transition ease-out duration-300",
        (y > 50 || pathname !== "/") && "bg-gray-900",
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src={logo}
            alt="Logo"
            width={0}
            height={0}
            className="w-32 h-auto"
          />
        </Link>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white cursor-pointer"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link
            href="/"
            className="text-sm/6 font-semibold"
            aria-label="Trang chủ"
          >
            Trang chủ
          </Link>
          <Link
            href="/gioi-thieu"
            className="text-sm/6 font-semibold"
            aria-label="Giới thiệu"
          >
            Giới thiệu
          </Link>
          <Link
            href="/cong-viec"
            className="text-sm/6 font-semibold"
            aria-label="Công việc"
          >
            Công việc
          </Link>
          <Link
            href="/lien-he"
            className="text-sm/6 font-semibold"
            aria-label="Liên hệ"
          >
            Liên hệ
          </Link>
        </div>
        <div className="hidden lg:flex">
          {session ? (
            <Menu as="div" className="relative">
              <MenuButton
                className="text-sm/6 text-white/80 hover:text-white cursor-pointer font-semibold flex items-center gap-x-2"
                aria-label={session.user.name}
              >
                <Image
                  src={session.user.avatar}
                  alt={session.user.name}
                  width={36}
                  height={36}
                  className="rounded-full object-cover"
                />
              </MenuButton>
              <MenuItems className="bg-white text-sm/6 font-medium text-gray-900 absolute top-full right-0 mt-4 p-1 w-60 rounded-md shadow border border-gray-300 z-50">
                <MenuItem>
                  <div className="px-3 py-1.5 rounded-md">
                    <div className="flex items-center">
                      <Image
                        src={session.user.avatar}
                        alt={session.user.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <div className="ml-1.5">
                        <h3 className="font-semibold text-sm">
                          {session.user.name}
                        </h3>
                        <p className="text-gray-700 text-xs">
                          {session.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </MenuItem>

                <MenuItem>
                  <Link
                    className="flex items-center space-x-1.5 hover:bg-gray-100 px-3 py-1.5 rounded-md"
                    href="/tai-khoan"
                  >
                    <UserCircleIcon className="size-4" />

                    <span>Tài khoản</span>
                  </Link>
                </MenuItem>

                <MenuItem>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-1.5 hover:bg-gray-100 px-3 py-1.5 rounded-md"
                  >
                    <ArrowLeftStartOnRectangleIcon className="size-4" />
                    <span>Đăng xuất</span>
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          ) : (
            <Link
              href="/dang-nhap"
              className="text-sm/6 text-white/80 hover:text-white font-semibold flex items-center gap-x-1"
              aria-label="Đăng nhập"
            >
              Đăng nhập <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/50 duration-300 ease-out data-closed:opacity-0 z-40"
        />
        <DialogPanel
          transition
          className="fixed inset-y-0 right-0 w-full overflow-y-auto bg-white px-6 py-6 duration-300 ease-out data-closed:translate-x-full sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 z-40"
        >
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5 text-gray-900">
              <Image
                src={logo}
                alt="Logo"
                width={0}
                height={0}
                className="w-28 h-auto"
              />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700 cursor-pointer"
              aria-label="Close menu"
            >
              <XMarkIcon className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/25">
              <div className="space-y-2 py-6">
                <Link
                  href="/"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  aria-label="Trang chủ"
                >
                  Trang chủ
                </Link>
                <Link
                  href="/gioi-thieu"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  aria-label="Giới thiệu"
                >
                  Giới thiệu
                </Link>
                <Link
                  href="/cong-viec"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  aria-label="Công việc"
                >
                  Công việc
                </Link>
                <Link
                  href="/lien-he"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  aria-label="Liên hệ"
                >
                  Liên hệ
                </Link>
              </div>
              <div className="py-6">
                {session ? (
                  <>
                    <div className="py-2 rounded-lg text-gray-900 text-base/7">
                      <div className="flex items-center">
                        <Image
                          src={session.user.avatar}
                          alt={session.user.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                        <div className="ml-2">
                          <h3 className="font-semibold">{session.user.name}</h3>
                          <p className="text-gray-700 text-sm">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/tai-khoan"
                      aria-label={session.user.name}
                      className="-mx-3 flex items-center space-x-1.5 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <UserCircleIcon className="size-4" />
                      <span>Tài khoản</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="-mx-3 flex items-center space-x-1.5 rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <ArrowLeftStartOnRectangleIcon className="size-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/dang-nhap"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                    aria-label="Đăng nhập"
                  >
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}

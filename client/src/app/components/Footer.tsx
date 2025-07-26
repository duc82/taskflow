"use client";
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/taskflow.png";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const pathnames = pathname.split("/").slice(1);

  if (pathnames[0] === "cong-viec" && pathnames.length >= 2) {
    return null;
  }

  return (
    <footer className="bg-slate-900">
      <div className="p-4 md:py-8 max-w-7xl mx-auto">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center mb-4 sm:mb-0">
            <Image
              src={logo}
              width={0}
              height={0}
              sizes="100vw"
              className="h-8 w-auto"
              alt="Logo"
            />
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:underline me-4 md:me-6">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/gioi-thieu" className="hover:underline me-4 md:me-6">
                Giới thiệu
              </Link>
            </li>
            <li>
              <Link href="/cong-viec" className="hover:underline me-4 md:me-6">
                Công việc
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="hover:underline">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()}{" "}
          <Link href="/" className="hover:underline">
            TaskFlow™
          </Link>
          . Đã đăng ký bản quyền.
        </span>
      </div>
    </footer>
  );
}

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Features from "../components/Home/Features";
import Stats from "../components/Home/Stats";
import Testimonials from "../components/Home/Testimonials";

export default async function Home() {
  return (
    <div>
      <section className="h-screen w-full relative">
        <video
          src="/hero.mp4"
          muted
          autoPlay
          playsInline
          loop
          className="w-full h-full object-cover"
        ></video>
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full z-20">
          <div className="max-w-2xl px-4 mx-auto text-center">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm/6 ring-1 text-gray-200 ring-gray-100/10 hover:ring-gray-100/20">
                Quản lý đánh giá công việc hàng đầu{" "}
                <Link
                  href="/gioi-thieu"
                  className="font-semibold text-blue-600 inline-flex items-center gap-x-1"
                >
                  <span aria-hidden="true" className="absolute inset-0" />
                  Đọc thêm <ArrowRightIcon className="size-4" />
                </Link>
              </div>
            </div>
            <h1 className="text-5xl leading-tight tracking-tight text-balance text-white font-semibold">
              Quản lý đánh giá mức độ hoàn thành công việc
            </h1>
            <p className="text-gray-200 font-medium text-lg text-pretty mt-8 sm:text-xl/8">
              Dễ dàng quản lý công việc, đánh giá mức độ hoàn thành công việc
              của cá nhân, nhóm và doanh nghiệp.
            </p>
            <div className="mt-10 flex items-center justify-center space-x-6 text-white">
              <Link
                href="/dang-nhap"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                aria-label="Bắt đầu ngay"
              >
                Bắt đầu ngay
              </Link>
              <Link
                href="/gioi-thieu"
                className="text-sm/6 font-semibold flex items-center gap-x-1"
              >
                Xem thêm <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Features />
      <Stats />
      <Testimonials />
    </div>
  );
}

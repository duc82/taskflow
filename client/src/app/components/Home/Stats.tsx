"use client";
import statsImg from "@/app/assets/stats.png";
import Image from "next/image";
import CountUp from "react-countup";

const stats = [
  {
    name: "Người dùng",
    value: "1000+",
  },
  {
    name: "Công việc",
    value: "5000+",
  },
  {
    name: "Đánh giá",
    value: "10000+",
  },
  {
    name: "Nhóm",
    value: "200+",
  },
];

export default function Stats() {
  return (
    <section className="relative text-white">
      <Image
        src={statsImg}
        alt={"Stats"}
        width={0}
        height={0}
        sizes="100vw"
        className="h-screen w-full object-cover brightness-75"
      />
      <div className="absolute top-1/2 -translate-y-1/2 w-full">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <span className="text-lg font-medium text-blue-600">Thống kê</span>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight text-pretty sm:text-5xl lg:text-balance">
              Được hơn 1000+ người dùng tin tưởng
            </h2>
            <p className="mt-8 sm:text-xl/8 text-lg text-gray-200 font-medium text-pretty">
              Chúng tôi đã giúp hàng ngàn người dùng quản lý công việc và đánh
              giá hiệu suất làm việc của họ một cách hiệu quả và dễ dàng hơn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-20">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative px-6 before:content-[''] before:w-px before:bg-white/20 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-full"
              >
                <CountUp
                  end={+stat.value.split("+")[0]}
                  suffix={stat.value[stat.value.length - 1]}
                  enableScrollSpy
                  scrollSpyOnce
                  className="text-4xl font-bold block mb-3"
                />
                <span className="text-base font-medium">{stat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

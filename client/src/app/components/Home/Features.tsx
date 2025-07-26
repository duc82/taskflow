import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Quản lý công việc (Task Management)",
    description: "Giúp người dùng tổ chức và theo dõi công việc hiệu quả.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Đánh giá và chấm điểm hiệu suất (Performance Review)",
    description: "Giúp cá nhân và nhóm hiểu rõ năng suất làm việc.",
    icon: LockClosedIcon,
  },
  {
    name: "Quản lý nhóm và tổ chức (Team & Organization Management)",
    description: "Hỗ trợ làm việc nhóm và quản lý công việc tập trung.",
    icon: ArrowPathIcon,
  },
  {
    name: "Báo cáo và phân tích (Reports & Insights)",
    description: "Cung cấp góc nhìn tổng quan về hiệu suất làm việc.",
    icon: FingerPrintIcon,
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <span className="text-base/7 font-semibold text-blue-600">
            Tính năng
          </span>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            Các tính năng nổi bật
          </h2>
          <p className="mt-6 text-lg/8 text-gray-600">
            Cung cấp các tính năng giúp người dùng quản lý c ng việc, đánh giá
            hiệu suất làm việc, quản lý nhóm và tổ chức, báo cáo và phân tích
            hiệu suất làm việc.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base/7 font-semibold text-gray-900">
                  <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg bg-blue-600">
                    <feature.icon
                      aria-hidden="true"
                      className="size-6 text-white"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base/7 text-gray-600">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

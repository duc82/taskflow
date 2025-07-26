import Link from "next/link";

export default function About() {
  return (
    <section className="w-full py-24 lg:py-28 min-h-screen bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Giới thiệu về chúng tôi
          </h1>
          <p className="text-gray-700 mb-6">
            Quản lý công việc hiệu quả với ứng dụng của chúng tôi. Chúng tôi
            cung cấp giải pháp quản lý công việc toàn diện, giúp bạn tổ chức và
            theo dõi tiến độ công việc một cách dễ dàng.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-8">
            <li>Đội ngũ chuyên nghiệp, giàu kinh nghiệm</li>
            <li>Luôn đặt khách hàng làm trung tâm</li>
            <li>Không ngừng đổi mới và sáng tạo</li>
          </ul>
          <Link
            href="/lien-he"
            className="inline-block px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Liên hệ với chúng tôi
          </Link>
        </div>
        <div className="flex-1 flex justify-center"></div>
      </div>
    </section>
  );
}

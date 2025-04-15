import Link from "next/link";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full bg-gray-100 py-24 lg:py-28">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mt-5 flex flex-col lg:flex-row">
          <aside className="lg:flex-[0_0_30%] lg:pr-4">
            <div className="bg-white shadow rounded-lg p-4">
              <nav className="space-y-2">
                <Link href="/tai-khoan" className="block hover:text-blue-500">
                  Thông tin tài khoản
                </Link>
                <Link
                  href="/tai-khoan/xoa-tai-khoan"
                  className="block hover:text-blue-500"
                >
                  Xóa tài khoản
                </Link>
                <Link href="/dang-xuat" className="block hover:text-blue-500">
                  Đăng xuất
                </Link>
              </nav>
            </div>
          </aside>
          <div className="lg:flex-[0_0_70%] lg:pl-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

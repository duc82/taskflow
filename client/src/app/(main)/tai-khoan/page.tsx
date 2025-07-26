import PasswordForm from "@/app/components/Account/PasswordForm";
import UpdateForm from "@/app/components/Account/UpdateForm";
import getServerSession from "@/app/libs/session";

export default async function Account() {
  const { user } = await getServerSession();

  return (
    <div>
      <div className="p-4 shadow rounded-lg bg-white mb-8">
        <h2 className="text-xl font-bold mb-1">Tài khoản của tôi</h2>
        <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        <UpdateForm user={user} />
      </div>
      <div className="p-4 shadow rounded-lg bg-white">
        <h2 className="text-xl font-bold mb-1">Đổi mật khẩu</h2>
        <p className="text-gray-600">Đổi mật khẩu tài khoản của bạn</p>
        <PasswordForm />
      </div>
    </div>
  );
}

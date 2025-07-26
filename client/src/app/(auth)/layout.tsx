import { redirect } from "next/navigation";
import { auth } from "../api/auth/[...nextauth]/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (session) {
    redirect("/cong-viec");
  }

  return children;
}

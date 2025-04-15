import { redirect } from "next/navigation";
import { auth } from "../api/auth/[...nextauth]/auth";

const getServerSession = async () => {
  const session = await auth();

  if (!session) {
    redirect("/dang-nhap");
  }

  return session;
};

export default getServerSession;

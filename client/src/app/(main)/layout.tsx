import { SessionProvider } from "next-auth/react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { auth } from "../api/auth/[...nextauth]/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider>
      <Header session={session} />
      {children}
      <Footer />
    </SessionProvider>
  );
}

import { SessionProvider } from "next-auth/react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { auth } from "../api/auth/[...nextauth]/auth";
import { Metadata } from "next";

export const generateMetadata = async (): Promise<Metadata> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metadata`);
  const metadata = await response.json();
  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
  };
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <SessionProvider
      session={session}
      refetchInterval={60}
      refetchOnWindowFocus
    >
      <Header session={session} />
      {children}
      <Footer />
    </SessionProvider>
  );
}

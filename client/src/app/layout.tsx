import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProgressBar from "./components/ProgressBar";
import Toast from "./components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý đánh giá mức độ hoàn thành công việc",
  description:
    "Dễ dàng quản lý công việc, đánh giá mức độ hoàn thành công việc của cá nhân, nhóm và doanh nghiệp.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} antialiased`}>
        <Toast />
        <ProgressBar>{children}</ProgressBar>
      </body>
    </html>
  );
}

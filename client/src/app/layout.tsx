import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProgressBar from "./components/ProgressBar";
import Toast from "./components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quản lý đánh giá mức độ hoàn thành công việc",
  description:
    "Dễ dàng quản lý công việc, đánh giá mức độ hoàn thành công việc của cá nhân, nhóm và doanh nghiệp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toast />
        <ProgressBar>{children}</ProgressBar>
      </body>
    </html>
  );
}

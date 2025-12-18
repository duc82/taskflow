import { Inter } from "next/font/google";
import "./globals.css";
import ProgressBar from "./components/ProgressBar";
import Toast from "./components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
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

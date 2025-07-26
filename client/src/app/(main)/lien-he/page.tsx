"use client";
import Link from "next/link";
import React, { useState } from "react";

export default function Contact() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      console.log(response);
      setValues({ name: "", email: "", message: "" });
    } catch (error) {
      console.log("Error submitting contact form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full py-24 lg:py-28 min-h-screen items-center flex bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center shadow-xl rounded-3xl bg-white/80 backdrop-blur-lg">
        {/* Left Side: Info */}
        <div className="md:w-1/2 w-full p-8 flex flex-col items-start">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">
            Liên hệ với chúng tôi
          </h2>
          <p className="text-gray-600 mb-6">
            Hãy gửi cho chúng tôi một tin nhắn và chúng tôi sẽ phản hồi sớm nhất
            có thể!
          </p>
          <div className="space-y-3 text-gray-700">
            <Link
              href="mailto:duccdht123@gmail.com"
              className="flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M16 2v6a2 2 0 002 2h6"></path>
                <path d="M2 7v13a2 2 0 002 2h16a2 2 0 002-2V7"></path>
              </svg>
              <span>duccdht123@gmail.com</span>
            </Link>
            <Link href="tel:+84123456789" className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>0123 456 789</span>
            </Link>
            <Link
              href="https://maps.app.goo.gl/4gLFMrRaHrxxUqji9"
              target="_blank"
              className="flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M21 10.5a8.38 8.38 0 01-3.5.5c-4.5 0-8-3.5-8-8a8.38 8.38 0 01.5-3.5"></path>
                <path d="M2 2l20 20"></path>
              </svg>
              <span>Số 28A Lê Trọng Tấn, Hà Đông, Hà Nội</span>
            </Link>
          </div>
        </div>
        {/* Right Side: Form */}
        <div className="md:w-1/2 w-full p-8">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Nhập họ và tên"
                name="name"
                value={values.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Nhập email"
                name="email"
                value={values.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 outline-none"
                rows={4}
                placeholder="Nhập nội dung liên hệ"
                name="message"
                value={values.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
            >
              Gửi liên hệ
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

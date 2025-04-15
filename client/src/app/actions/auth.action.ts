"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const signUp = async (prevState: any, formData: FormData) => {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`, {
    body: JSON.stringify({
      name,
      email,
      password,
      confirmPassword,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.message,
    };
  }

  redirect("/dang-nhap");
};

export const refreshToken = async (token: string): Promise<string | null> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      credentials: "include",
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return null;
  }

  return data.accessToken;
};

export const removeRefreshToken = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("refreshToken");
};

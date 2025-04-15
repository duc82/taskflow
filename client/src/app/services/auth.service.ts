"use client";

import { SignInResponse } from "../types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function signIn(
  email: string,
  password: string
): Promise<SignInResponse> {
  const res = await fetch(`${API_URL}/auth/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const result = await res.json();

  if (!res.ok) throw new Error(result.message);

  return result;
}

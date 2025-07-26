"use client";
import { getSession } from "next-auth/react";

type METHOD = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface CustomRequestInit extends RequestInit {
  method?: METHOD;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchAuth = async <T>(
  url: string,
  init?: CustomRequestInit
): Promise<T> => {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { accessToken, refreshToken } = session;

  const headers = new Headers(init?.headers || {});

  headers.set("Authorization", `Bearer ${accessToken}`);
  if (!(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshRes = await fetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      body: JSON.stringify({ token: refreshToken }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      credentials: "include",
    });

    if (!refreshRes.ok) throw new Error("Unauthorized");

    const { accessToken: newAccessToken } = await refreshRes.json();

    headers.set("Authorization", `Bearer ${newAccessToken}`);

    return fetchAuth(`${API_URL}${url}`, {
      ...init,
      headers,
    });
  }

  const result = await res.json();

  if (!res.ok) throw new Error(result.message);

  return result;
};

export default fetchAuth;

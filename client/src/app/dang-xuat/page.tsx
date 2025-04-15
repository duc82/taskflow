"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { removeRefreshToken } from "../actions/auth.action";
import Spinner from "../components/Spinner";

export default function SignOut() {
  useEffect(() => {
    Promise.all([
      removeRefreshToken(),
      signOut({
        redirect: true,
        redirectTo: "/dang-nhap",
      }),
    ]);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  );
}

import { MiddlewareConfig, NextResponse } from "next/server";
import { auth, signOut } from "./app/api/auth/[...nextauth]/auth";

// Redirect to the sign in page if the user is not authenticated
export default auth(async (req) => {
  const url = req.nextUrl;
  url.pathname = "/dang-nhap";

  if (!req.auth) {
    return NextResponse.redirect(url);
  }

  if (req.auth.error === "RefreshTokenError") {
    await signOut({ redirect: false });
    return NextResponse.redirect(url);
  }
});

export const config: MiddlewareConfig = {
  matcher: ["/(cong-viec|tai-khoan)/:path*"],
};

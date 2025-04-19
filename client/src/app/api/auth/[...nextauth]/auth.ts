import { User } from "@/app/types/user";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { jwtVerify } from "jose";
import { refreshToken } from "@/app/actions/auth.action";
import { cookies } from "next/headers";

interface CredentialsResponse extends User {
  accessToken: string;
  redirect: boolean;
  redirectTo: string;
  csrfToken: string;
  callbackUrl: string;
}

const encodedKey = new TextEncoder().encode(
  process.env.NEXT_PUBLIC_JWT_ACCESS_SECRET as string
);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {},
      authorize: async (credentials) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { redirect, redirectTo, csrfToken, callbackUrl, ...res } =
          credentials as CredentialsResponse;
        return res;
      },
    }),
  ],

  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      const cookieStore = await cookies();
      const rfToken = cookieStore.get("refreshToken")?.value;

      if (user) {
        token = { ...token, ...user, refreshToken: rfToken || "" };
      } else {
        // Refresh token if access token is expired
        try {
          await jwtVerify(token.accessToken, encodedKey);
        } catch (_error) {
          if (!rfToken) {
            token.error = "RefreshTokenError";
            return token;
          }
          const accessToken = await refreshToken(rfToken);
          if (!accessToken) {
            return token;
          }
          token.accessToken = accessToken;
          token.error = undefined;
        }
      }

      if (trigger === "update") {
        token = { ...token, ...session };
      }

      return token;
    },
    session: async ({ session, token }) => {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        avatar: token.avatar,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
      };
      session.error = token.error;

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/dang-nhap",
    error: "/dang-nhap",
    newUser: "/",
    signOut: "/dang-xuat",
    verifyRequest: "/xac-thuc-email",
  },
});

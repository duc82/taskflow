import "next-auth/jwt";
import type { User as IUser } from "@/app/types/user";
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface User extends IUser {
    accessToken: string;
  }

  interface Session extends DefaultSession {
    accessToken: string;
    refreshToken: string;
    user: IUser;
    error?: "RefreshTokenError";
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends IUser {
    accessToken: string;
    refreshToken: string;
    user: IUser;
    error?: "RefreshTokenError";
  }
}

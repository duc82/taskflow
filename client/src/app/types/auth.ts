import { User } from "./user";

export interface SignInResponse {
  user: User;
  message: string;
  accessToken: string;
}

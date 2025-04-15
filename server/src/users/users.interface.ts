import { UserRole } from "./users.enum";

export interface UserPayload {
  userId: string;
  role: UserRole;
}

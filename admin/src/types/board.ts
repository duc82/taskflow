import type { Column } from "./column";
import type { Label } from "./task";
import type { User } from "./user";

export interface BoardMember {
  id: string;
  user: User;
  board: Board;
  role: "member" | "admin";
}

export interface Board {
  id: string;
  title: string;
  cover: string | null;
  coverColor: string | null;
  columns: Column[];
  members: BoardMember[];
  visibility: "private" | "public";
  labels: Label[];
  owner: User;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

import { Column } from "./column";
import { User } from "./user";

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
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BoardReponse {
  board: Board;
  message: string;
}

export interface BoardsResponse {
  boards: Board[];
  total: number;
  page: number;
  limit: number;
}

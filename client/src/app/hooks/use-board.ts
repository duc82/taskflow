"use client";
import { useContext } from "react";
import { BoardContext } from "../components/Board/BoardContent";

export default function useBoard() {
  return useContext(BoardContext);
}

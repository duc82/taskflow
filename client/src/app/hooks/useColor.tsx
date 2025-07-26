"use client";

import { useEffect, useState } from "react";
import { Board } from "../types/board";
import {
  getContrastColorFromImage,
  getContrastColorFromRGB,
} from "../utils/getContrastColor";

export default function useColor(board: Board) {
  const [dynamicContrast, setDynamicContrast] = useState<"light" | "dark">(
    "light"
  );

  useEffect(() => {
    const fetchColor = async () => {
      if (board.cover) {
        setDynamicContrast(await getContrastColorFromImage(board.cover));
      } else {
        setDynamicContrast(getContrastColorFromRGB(board.coverColor || ""));
      }
    };

    fetchColor();
  }, [board]);

  return dynamicContrast;
}

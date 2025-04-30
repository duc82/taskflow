"use client";

import { useEffect, useState } from "react";
import { Board } from "../types/board";
import {
  getContrastColorFromImage,
  getContrastColorFromRGB,
} from "../utils/getContrastColor";

export default function useColor(board: Board) {
  const [dynamicColor, setDynamicColor] = useState<string>("#364153");

  useEffect(() => {
    const fetchColor = async () => {
      if (board.cover) {
        const color = await getContrastColorFromImage(board.cover);
        setDynamicColor(color);
      } else {
        setDynamicColor(getContrastColorFromRGB(board.coverColor || ""));
      }
    };

    fetchColor();
  }, [board]);

  return dynamicColor;
}

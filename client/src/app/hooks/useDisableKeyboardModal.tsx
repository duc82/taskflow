"use client";

import { useEffect } from "react";

export default function useDisableKeyboardModal() {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const allowedHeadlessUIKeys = [
        "ArrowUp",
        "ArrowDown",
        "Enter",
        " ", // Space Key
        "Home",
        "End",
        "Escape",
      ];
      if (allowedHeadlessUIKeys.includes(e.key)) {
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeydown, true);
    return () => {
      window.removeEventListener("keydown", handleKeydown, true);
    };
  }, []);

  return null;
}

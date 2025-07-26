"use client";

import { useEffect, useRef } from "react";

export default function useClickOutside<T extends HTMLElement>({
  enable = true,
  cb,
}: {
  enable: boolean;
  cb: () => void;
}) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!enable) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        cb();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cb();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enable, cb]);

  return { containerRef };
}

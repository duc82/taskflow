"use client";

import { CSSProperties, useEffect } from "react";

export default function useBodyOverflow(overflow?: CSSProperties["overflow"]) {
  useEffect(() => {
    document.body.style.overflow = overflow || "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [overflow]);

  return null;
}

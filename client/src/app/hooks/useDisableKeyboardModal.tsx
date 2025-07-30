"use client";

import { useEffect } from "react";

const allowedHeadlessUIKeys = [
  "ArrowUp",
  "ArrowDown",
  "Enter",
  " ",
  "Home",
  "End",
  "Escape",
] as const;

type AllowedKeys = (typeof allowedHeadlessUIKeys)[number];

interface DisableKeyboardModalProps {
  execepts: AllowedKeys[];
}

export default function useDisableKeyboardModal(
  props?: DisableKeyboardModalProps
) {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const newAllowedHeadlessUIKeys = props?.execepts
        ? allowedHeadlessUIKeys.filter((key) => !props.execepts.includes(key))
        : allowedHeadlessUIKeys;

      if ((newAllowedHeadlessUIKeys as string[]).includes(e.key)) {
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", handleKeydown, true);
    return () => {
      window.removeEventListener("keydown", handleKeydown, true);
    };
  }, [props?.execepts]);

  return null;
}

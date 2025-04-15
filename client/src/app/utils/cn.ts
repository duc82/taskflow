import clsx from "clsx";
import { ClassNameValue, twMerge } from "tailwind-merge";

export default function cn(...classNames: ClassNameValue[]) {
  return clsx(twMerge(...classNames));
}

"use server";
import { revalidateTag as revalidateTagCustom } from "next/cache";

export const revalidateTag = async (tag: string) => {
  return revalidateTagCustom(tag, "max");
};

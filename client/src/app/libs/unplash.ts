import { createApi } from "unsplash-js";

export interface UnplashImageURL {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  small_s3: string;
}

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_TOKEN!,
});

export default unsplash;

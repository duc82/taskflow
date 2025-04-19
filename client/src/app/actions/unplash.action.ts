"use server";
import { OrderBy } from "unsplash-js";
import unsplash, { UnplashImageURL } from "../libs/unplash";

export const getUnplashImages = async (
  page: number,
  perPage: number
): Promise<UnplashImageURL[]> => {
  try {
    const unplashResponse = await unsplash.collections.getPhotos({
      page,
      perPage,
      orderBy: OrderBy.LATEST,
      collectionId: "317099",
    });

    return unplashResponse.response?.results.map((data) => data.urls) || [];
  } catch (_error) {
    return [];
  }
};

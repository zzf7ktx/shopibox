"use server";

import { ImageSourceType } from "@/types/ImageSourceType";
import { syncImageWithMainProvider } from ".";

export const syncManyImagesWithMainProvider = async (
  imageIds: string[],
  sourceType: ImageSourceType
) => {
  for (let imageId of imageIds) {
    await syncImageWithMainProvider(imageId, sourceType);
  }
};

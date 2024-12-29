"use server";

import { ImageSourceType } from "@/types/imageSourceType";
import { syncImage } from "./syncImage";
import { StorageProvider } from "@/types/storageProvider";

export const syncManyImages = async (
  imageIds: string[],
  sourceType: ImageSourceType,
  provider: StorageProvider = StorageProvider.Azure
) => {
  for (let imageId of imageIds) {
    await syncImage(imageId, sourceType, provider);
  }
};

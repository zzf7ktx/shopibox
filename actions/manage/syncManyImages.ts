"use server";

import { ImageSourceType } from "@/types/imageSourceType";
import { syncImage } from "./syncImage";
import { StorageProvider } from "@/types/storageProvider";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";

export const syncManyImages = async (
  imageIds: string[],
  sourceType: ImageSourceType,
  provider: StorageProvider = StorageProvider.Azure
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.UpdateImage, Claim.ReadImage], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  for (let imageId of imageIds) {
    await syncImage(imageId, sourceType, provider);
  }
};

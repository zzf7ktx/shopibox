"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";
import { ImageSourceType } from "@/types/imageSourceType";
import { StorageProvider } from "@/types/storageProvider";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";

export const syncImage = async (
  imageId: string,
  sourceType: ImageSourceType,
  provider: StorageProvider = StorageProvider.Azure
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.UpdateImage, Claim.ReadImage], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
    },
  });

  if (image?.syncStatus === "Synced") {
    return { success: false };
  }

  let sourceLink: string =
    image?.sourceLink ?? image?.cloudLink ?? image?.backupLink ?? "";

  switch (sourceType) {
    case "backup":
      sourceLink = image?.backupLink ?? sourceLink;
      break;
    case "original":
      sourceLink = image?.sourceLink ?? sourceLink;
      break;
    case "main":
      sourceLink = image?.cloudLink ?? sourceLink;
      break;
  }

  const uploadResult = await storage.upload(
    sourceLink,
    {
      overwrite: true,
      publicId: image?.providerRef ?? "",
      folder: "shopify",
    },
    provider
  );

  await prisma.image.update({
    data: {
      syncStatus: "Synced",
      cloudLink: uploadResult.secureUrl,
      providerRef: uploadResult.publicId,
      provider: StorageProvider.Azure,
      source: "Auto",
    },
    where: {
      id: image?.id,
    },
  });
  return { success: true, url: uploadResult.secureUrl };
};

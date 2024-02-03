"use server";

import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { ImageSourceType } from "@/types/ImageSourceType";

export const syncImageWithMainProvider = async (
  imageId: string,
  sourceType: ImageSourceType
) => {
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

  const uploadResult = await cloudinary.uploader.upload(sourceLink, {
    overwrite: true,
    public_id: image?.providerRef ?? "",
    folder: "shopify",
  });

  await prisma.image.update({
    data: {
      syncStatus: "Synced",
      cloudLink: uploadResult.secure_url,
    },
    where: {
      id: image?.id,
    },
  });
};

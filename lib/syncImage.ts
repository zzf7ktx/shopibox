import { ImageSourceType } from "@/types/imageSourceType";
import prisma from "./prisma";
import storage from "./storage";
import { StorageProvider } from "@/types/storageProvider";

export const syncImage = async (
  imageId: string,
  provider: StorageProvider = StorageProvider.Azure
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

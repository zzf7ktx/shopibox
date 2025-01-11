"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";
import { StorageProvider } from "@/types/storageProvider";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";

export const updateShopLogo = async (shopId: string, formData: FormData) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [Claim.ReadShop, Claim.UpdateShop, Claim.AddImage, Claim.UpdateImage],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

  const file: File = formData.get("file") as unknown as File;
  const shop = await prisma.shop.findFirst({
    where: { id: shopId },
    include: {
      images: true,
    },
  });

  if (!shop) {
    return { success: false, data: "Shop is not exist" };
  }

  let imageSrc: string | undefined = undefined;
  if (!file || typeof file !== "object") {
    return { success: false, data: "File is not valid" };
  }

  try {
    const uploadResult = await storage.uploadFile(file, {
      overwrite: true,
      publicId: shop.images?.[0]?.providerRef ?? "",
      folder: `shopify/${shopId}`,
    });

    imageSrc = uploadResult?.secureUrl;

    await prisma.image.upsert({
      where: {
        id: shop.logoImageId ?? "",
      },
      create: {
        cloudLink: imageSrc,
        name: "Logo",
        source: "Manual",
        syncStatus: "Synced",
        provider: StorageProvider.Azure,
        shopId: shopId,
        providerRef: uploadResult.publicId,
      },
      update: {
        cloudLink: imageSrc,
      },
    });
  } catch (error) {
    return { success: false, data: "Failed in uploading image" };
  }

  return { success: true };
};

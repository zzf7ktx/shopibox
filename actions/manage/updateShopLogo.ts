"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";

export interface UpdateShopLogoFormFields {
  imageId: string;
}

export const updateShopLogo = async (
  shopId: string,
  data: UpdateShopLogoFormFields,
  formData: FormData
) => {
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
        id: shop.images.find((i) => !i.productId)?.id ?? "",
      },
      create: {
        cloudLink: imageSrc,
        name: "Logo",
        source: "Manual",
        syncStatus: "Synced",
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

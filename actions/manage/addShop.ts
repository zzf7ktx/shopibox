"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";
import { ShopProvider } from "@/types/shopProvider";

export interface AddShopFormFields {
  name: string;
  shopDomain: string;
  apiKey: string;
  apiSerect: string;
  accessToken: string;
  provider: ShopProvider;
}

export const addShop = async (data: AddShopFormFields, formData: FormData) => {
  const file: File = formData.get("file") as unknown as File;

  const shop = await prisma.shop.create({
    data: {
      name: data.name,
      shopDomain: data.shopDomain,
      provider: data.provider,
      credentials: {
        create: {
          shopDomain: data.shopDomain,
          apiKey: data.apiKey,
          apiSerect: data.apiSerect,
          accessToken: data.accessToken,
        },
      },
    },
    include: {
      images: {
        take: 1,
      },
    },
  });

  let uploadResult;
  if (!!file && typeof file === "object") {
    uploadResult = await storage.uploadFile(file, {
      overwrite: true,
      publicId: shop.images.find((i) => !i.productId)?.providerRef ?? "",
      folder: `shopify/${shop.id}`,
    });
  }

  const updatedShop = prisma.shop.update({
    where: {
      id: shop.id,
    },
    data: {
      images: {
        create: {
          cloudLink: uploadResult?.secureUrl ?? "",
          name: "logo",
          source: "Manual",
          syncStatus: "Synced",
          providerRef: uploadResult?.publicId,
        },
      },
    },
    include: {
      images: true,
    },
  });

  return updatedShop;
};

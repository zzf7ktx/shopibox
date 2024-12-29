"use server";

import prisma from "@/lib/prisma";
import shopProvider from "@/lib/shopProvider";
import { ShopProvider } from "@/types/shopProvider";
import { ShopStatus } from "@prisma/client";

export const publishCollectionProducts = async (
  shopId: string,
  collectionId: string
) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      credentials: true,
      products: {
        where: {
          status: "NotPublished",
          product: {
            collections: {
              some: {
                collectionId: collectionId,
              },
            },
          },
        },
        include: {
          product: {
            include: {
              images: true,
              variants: true,
              collections: {
                include: {
                  collection: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!shop) {
    return { success: false, data: "Shop is not exist" };
  }

  if (shop.products.length === 0) {
    return { success: false, data: "There is no products in shop" };
  }

  if (shop.status != ShopStatus.Active) {
    return { success: false, data: "Shop is not active" };
  }

  await shopProvider.uploadProductMany(
    shop.products.map((p) => p.product),
    shop.credentials[0],
    shop.provider as ShopProvider
  );

  await prisma.productsOnShops.updateMany({
    where: {
      shopId: shopId,
      productId: {
        in: shop.products.map((p) => p.productId),
      },
    },
    data: {
      status: "Published",
    },
  });

  return { success: true };
};

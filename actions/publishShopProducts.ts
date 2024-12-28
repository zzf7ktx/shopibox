"use server";
import prisma from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";

export const publishShopProducts = async (
  shopId: string,
  batchSize: number = 20
) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      products: {
        where: {
          status: "NotPublished",
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

  const job = await prisma.job.create({
    data: {
      batchSize: batchSize,
      productIds: shop.products.map((p) => p.productId),
      shopId: shopId,
    },
  });

  return { success: true, data: job.id };
};

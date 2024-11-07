"use server";
import prisma from "@/lib/prisma";

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
    return { success: false };
  }

  if (shop.products.length === 0) {
    return { success: false };
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

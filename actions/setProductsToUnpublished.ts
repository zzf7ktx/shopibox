"use server";

import prisma from "@/lib/prisma";

export const setProductsToUnpublished = async (
  shopId: string,
  productIds: string[]
) => {
  const shops = await prisma.productsOnShops.updateMany({
    data: {
      status: "NotPublished",
    },
    where: {
      shopId,
      AND: {
        productId: {
          in: productIds,
        },
      },
    },
  });
  return shops;
};

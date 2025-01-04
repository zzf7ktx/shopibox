"use server";

import prisma from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";
import { run } from "@/lib/workflow/workflow";

export const publishProducts = async (
  shopId: string,
  productIds: string[],
  autoRewriteTitle: boolean = false
) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      workflow: true,
      credentials: true,
      products: {
        where: {
          status: "NotPublished",
          productId: {
            in: productIds,
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

  await run(
    shop.products.map((p) => p.product),
    shop.workflowId!
  );

  return { success: true, data: { no: shop.products.length } };
};

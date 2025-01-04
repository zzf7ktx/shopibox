"use server";

import prisma from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";
import { run } from "@/lib/workflow/workflow";

export const publishSingleProduct = async (
  shopId: string,
  productId: string
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
          productId,
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

  if (shop.products[0].status !== "NotPublished") {
    return { success: false, data: "Product is not published yet" };
  }

  await run(
    shop.products.map((p) => p.product),
    shop.workflowId!
  );

  return { success: true };
};

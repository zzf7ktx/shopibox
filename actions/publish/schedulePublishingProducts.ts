"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { ShopStatus } from "@prisma/client";

export const schedulePublishingProducts = async (
  shopId: string,
  batchSize: number = 20
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.PushToShop], userClaims)) {
    return { success: false, data: "Access denied" };
  }

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

  await prisma.productsOnShops.updateMany({
    where: {
      shopId: shopId,
      productId: {
        in: shop.products.map((p) => p.productId),
      },
    },
    data: {
      status: "Scheduled",
    },
  });

  return { success: true, data: job.id };
};

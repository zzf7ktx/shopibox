"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const setProductsToUnpublished = async (
  shopId: string,
  productIds: string[]
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.PushToShop], userClaims)) {
    return { success: false, data: "Access denied" };
  }

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

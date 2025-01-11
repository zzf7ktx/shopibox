"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export interface AddProductsToShopFields {
  shopId: string;
  productIds: string[];
}

export const addProductsToShop = async (data: AddProductsToShopFields) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [
        Claim.UpdateProduct,
        Claim.UpdateShop,
        Claim.ReadProduct,
        Claim.ReadShop,
      ],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

  const preparedData = [];
  for (const productId of data.productIds) {
    preparedData.push({
      shopId: data.shopId,
      productId,
    });
  }
  const productsOnShops = await prisma.productsOnShops.createMany({
    data: preparedData,
    skipDuplicates: true,
  });

  return { success: true, data: productsOnShops.count };
};

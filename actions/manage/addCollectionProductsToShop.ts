"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export interface AddCollectionProductsToShopFields {
  shopId: string;
  collectionIds: string[];
}

export const addCollectionProductsToShop = async (
  data: AddCollectionProductsToShopFields
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [
        Claim.UpdateShop,
        Claim.ReadCollection,
        Claim.UpdateCollection,
        Claim.UpdateProduct,
      ],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

  const products = await prisma.product.findMany({
    where: {
      collections: {
        some: {
          collectionId: {
            in: data.collectionIds,
          },
        },
      },
    },
  });

  const preparedData = [];
  for (const product of products) {
    preparedData.push({
      shopId: data.shopId,
      productId: product.id,
    });
  }

  const productsOnShops = await prisma.productsOnShops.createMany({
    data: preparedData,
    skipDuplicates: true,
  });

  return { success: true, data: productsOnShops.count };
};

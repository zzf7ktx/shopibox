"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export interface AddProductsToCollectionFields {
  productIds: string[];
  collectionIds: string[];
}

export const addProductsToCollection = async (
  data: AddProductsToCollectionFields
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [
        Claim.UpdateProduct,
        Claim.AddCollection,
        Claim.UpdateCollection,
        Claim.ReadProduct,
        Claim.ReadCollection,
      ],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

  const preparedData = [];
  for (const collectionId of data.collectionIds) {
    // Create collection if not exist
    const result = await prisma.collection.upsert({
      where: {
        id: collectionId,
      },
      create: {
        name: collectionId,
      },
      update: {},
    });

    for (const productId of data.productIds) {
      preparedData.push({
        collectionId: result.id,
        productId,
      });
    }
  }
  const productsOnCollections = await prisma.productsOnCollections.createMany({
    data: preparedData,
    skipDuplicates: true,
  });

  return { success: true, data: productsOnCollections.count };
};

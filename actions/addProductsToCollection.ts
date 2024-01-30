"use server";

import prisma from "@/lib/prisma";

export interface AddProductsToCollectionFields {
  productIds: string[];
  collectionIds: string[];
}

export const addProductsToCollection = async (
  data: AddProductsToCollectionFields
) => {
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

  return productsOnCollections;
};

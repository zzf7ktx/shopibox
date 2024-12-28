"use server";

import prisma from "@/lib/prisma";

export interface AddCollectionProductsToShopFields {
  shopId: string;
  collectionIds: string[];
}

export const addCollectionProductsToShop = async (
  data: AddCollectionProductsToShopFields
) => {
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

  return productsOnShops;
};

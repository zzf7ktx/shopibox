"use server";

import prisma from "@/lib/prisma";

export interface AddProductsToShopFields {
  shopId: string;
  productIds: string[];
}

export const addProductsToShop = async (data: AddProductsToShopFields) => {
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

  return productsOnShops;
};

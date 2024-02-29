"use server";

import prisma from "@/lib/prisma";

export const getProductVariants = async (productId: string) => {
  const productVariations = await prisma.productVariation.findMany({
    where: {
      productId,
    },
  });
  return productVariations;
};

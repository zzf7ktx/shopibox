"use server";

import prisma from "@/lib/prisma";

export const getProduct = async (id: string) => {
  const product = await prisma.product.findFirst({
    where: {
      id,
    },
    include: {
      collections: true,
    },
  });
  return product;
};

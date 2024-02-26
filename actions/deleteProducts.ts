"use server";

import prisma from "@/lib/prisma";

export const deleteProducts = async (ids: string[]) => {
  const product = await prisma.product.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return product;
};

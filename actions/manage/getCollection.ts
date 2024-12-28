"use server";

import prisma from "@/lib/prisma";

export const getCollection = async (id: string) => {
  const product = await prisma.collection.findFirst({
    where: {
      id,
    },
  });
  return product;
};

"use server";

import prisma from "@/lib/prisma";

export const getShops = async () => {
  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true,
      syncStatus: true,
      provider: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return shops;
};

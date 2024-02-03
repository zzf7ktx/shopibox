"use server";

import prisma from "@/lib/prisma";

export const getShop = async (id: string) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      syncStatus: true,
      provider: true,
      maskImages: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return shop;
};

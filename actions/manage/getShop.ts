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
      status: true,
      syncStatus: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      images: true,
      shopDomain: true,
    },
  });

  return shop;
};

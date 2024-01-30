"use server";

import { AddShopFormFields } from "@/components/AddShopModal";
import prisma from "@/lib/prisma";

export const addShop = async (data: AddShopFormFields) => {
  const collection = await prisma.shop.create({
    data: {
      name: data.name,
      apiKey: data.apiKey,
      shopDomain: data.shopDomain,
    },
  });
  return collection;
};

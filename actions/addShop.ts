"use server";

import { AddShopFormFields } from "@/components/AddShopModal";
import prisma from "@/lib/prisma";

export const addShop = async (data: AddShopFormFields) => {
  const collection = await prisma.shop.create({
    data: {
      name: data.name,
      collections: {
        create: data.collections.map((collection) => ({
          collection: {
            connectOrCreate: {
              where: {
                id: collection,
              },
              create: {
                name: collection,
              },
            },
          },
        })),
      },
    },
  });
  return collection;
};

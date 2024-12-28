"use server";

import prisma from "@/lib/prisma";
import { deleteImages } from "./deleteImages";

export const deleteProducts = async (
  ids: string[],
  alsoDeleteImages: boolean = false
) => {
  if (alsoDeleteImages) {
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const imageIds = [];
    for (const product of products) {
      imageIds.push(product.id);
    }

    deleteImages(imageIds);
  }

  const product = await prisma.product.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return product;
};

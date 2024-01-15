"use server";

import { AddProductFormFields } from "@/components/AddManualProductModal";
import prisma from "@/lib/prisma";

export const addProduct = async (data: AddProductFormFields) => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      descriptionHtml: data.descriptionHtml,
      category: data.category ? data.category.join(" > ") : "",
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
  return product;
};

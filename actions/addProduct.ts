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
    },
  });
  return product;
};

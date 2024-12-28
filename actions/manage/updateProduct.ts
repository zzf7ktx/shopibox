"use server";

import prisma from "@/lib/prisma";

export interface UpdateProductFormFields {
  name?: string;
  price?: number;
  description?: string;
  descriptionHtml?: string;
  category?: string[];
  collections?: string[];
}

export const updateProduct = async (
  productId: string,
  data: UpdateProductFormFields
) => {
  const [_, product] = await prisma.$transaction([
    prisma.productsOnCollections.deleteMany({
      where: {
        productId,
      },
    }),
    prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        descriptionHtml: data.descriptionHtml,
        category: data.category ? data.category.join(" > ") : "",
        ...(!data.collections
          ? {}
          : {
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
            }),
      },
    }),
  ]);

  return product;
};

"use server";
import prisma from "@/lib/prisma";

export interface AddOrUpdateProductVariantsFields {
  variants: {
    name: string;
    values: string[];
  }[];
}

export const addOrUpdateProductVariants = async (
  productId: string,
  data: AddOrUpdateProductVariantsFields
) => {
  await prisma.productVariation.deleteMany({
    where: {
      productId,
    },
  });

  const addVariantsData: { key: string; value: string; productId: string }[] =
    data.variants.reduce(
      (acc, cur) =>
        acc.concat(
          cur.values.map((cv) => ({ key: cur.name, value: cv, productId }))
        ),
      [] as { key: string; value: string; productId: string }[]
    );
  const variants = prisma.productVariation.createMany({
    data: addVariantsData,
  });
  return variants;
};

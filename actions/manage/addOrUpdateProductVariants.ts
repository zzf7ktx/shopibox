"use server";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

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
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.UpdateProduct], userClaims)) {
    return { success: false, data: "Access denied" };
  }

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

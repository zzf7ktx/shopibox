"use server";

import { AddProductFormFields } from "@/components/AddManualProductModal";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const addProduct = async (data: AddProductFormFields) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [
        Claim.AddProduct,
        Claim.UpdateCollection,
        Claim.AddCollection,
        Claim.ReadProduct,
        Claim.ReadCollection,
      ],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

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
  return { success: true, data: product };
};

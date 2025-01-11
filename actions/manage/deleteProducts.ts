"use server";

import prisma from "@/lib/prisma";
import { deleteImages } from "./deleteImages";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";

export const deleteProducts = async (
  ids: string[],
  alsoDeleteImages: boolean = false
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [
        Claim.DeleteProduct,
        Claim.DeleteImage,
        Claim.ReadProduct,
        Claim.ReadImage,
      ],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

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

"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const getProduct = async (id: string) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadProduct], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const product = await prisma.product.findFirst({
    where: {
      id,
    },
    include: {
      collections: true,
    },
  });
  return { success: true, data: product };
};

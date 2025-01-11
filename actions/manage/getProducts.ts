"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const getProducts = async () => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadProduct], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const products = await prisma.product.findMany();
  return { success: true, data: products };
};

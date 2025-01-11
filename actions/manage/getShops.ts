"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const getShops = async () => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadShop], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true,
      syncStatus: true,
      provider: true,
      images: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return { success: true, data: shops };
};

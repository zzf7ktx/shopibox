"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const getShop = async (id: string) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadShop], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const shop = await prisma.shop.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      status: true,
      syncStatus: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      images: true,
      shopDomain: true,
    },
  });

  return { success: true, data: shop };
};

"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const getCollection = async (id: string) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadCollection], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const collection = await prisma.collection.findFirst({
    where: {
      id,
    },
  });

  return { success: true, data: collection };
};

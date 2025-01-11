"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const deleteCollections = async (ids: string[]) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.DeleteCollection, Claim.ReadCollection], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const collection = await prisma.collection.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return collection;
};

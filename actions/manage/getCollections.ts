"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export const getCollections = async () => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadCollection], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const collections = await prisma.collection.findMany();
  return { success: true, data: collections };
};

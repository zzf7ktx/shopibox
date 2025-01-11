"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
export interface AddCollectionFormFields {
  name: string;
  publicName?: string;
  description?: string;
}

export const addCollection = async (data: AddCollectionFormFields) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.AddCollection], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description,
      publicName: data.publicName ?? data.name,
    },
  });
  return collection;
};

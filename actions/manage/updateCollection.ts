"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";

export interface UpdateCollectionFormFields {
  name?: string;
  description?: string;
}

export const updateCollection = async (
  collectionId: string,
  data: UpdateCollectionFormFields
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.UpdateCollection, Claim.ReadCollection], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const collection = await prisma.collection.update({
    where: {
      id: collectionId,
    },
    data: {
      name: data.name,
      description: data.description,
    },
  });

  return collection;
};

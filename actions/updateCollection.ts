"use server";

import prisma from "@/lib/prisma";

export interface UpdateCollectionFormFields {
  name?: string;
  description?: string;
}

export const updateCollection = async (
  collectionId: string,
  data: UpdateCollectionFormFields
) => {
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

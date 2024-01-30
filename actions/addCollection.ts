"use server";

import prisma from "@/lib/prisma";
export interface AddCollectionFormFields {
  name: string;
  publicName?: string;
  description?: string;
}

export const addCollection = async (data: AddCollectionFormFields) => {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description,
      publicName: data.publicName ?? data.name,
    },
  });
  return collection;
};

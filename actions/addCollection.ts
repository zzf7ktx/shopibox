"use server";

import { AddCollectionFormFields } from "@/components/AddManualCollectionModal";
import prisma from "@/lib/prisma";

export const addCollection = async (data: AddCollectionFormFields) => {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
    },
  });
  return collection;
};

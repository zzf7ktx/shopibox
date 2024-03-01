"use server";

import prisma from "@/lib/prisma";

export const deleteCollections = async (ids: string[]) => {
  const collection = await prisma.collection.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return collection;
};

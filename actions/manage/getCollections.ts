"use server";

import prisma from "@/lib/prisma";

export const getCollections = async () => {
  const collections = await prisma.collection.findMany();
  return collections;
};

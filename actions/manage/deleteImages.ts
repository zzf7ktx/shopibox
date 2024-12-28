"use server";

import prisma from "@/lib/prisma";
import storage from "@/lib/storage";

export const deleteImages = async (ids: string[]) => {
  const images = await prisma.image.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  let count = 0;

  for (const image of images) {
    if (!image.providerRef) {
      continue;
    }

    await storage.remove(image.providerRef);
    const result = await prisma.image.deleteMany({
      where: {
        id: image.id,
      },
    });
    count += result.count;
  }

  return count;
};

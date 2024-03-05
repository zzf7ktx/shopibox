"use server";

import prisma from "@/lib/prisma";

export const deleteImages = async (ids: string[]) => {
  const image = await prisma.image.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return image;
};

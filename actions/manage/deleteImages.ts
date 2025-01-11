"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import storage from "@/lib/storage";
import { Claim } from "@/types/claim";

export const deleteImages = async (ids: string[]) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.DeleteImage, Claim.ReadImage], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const images = await prisma.image.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  let count = 0;

  for (const image of images) {
    image.providerRef && (await storage.remove(image.providerRef));
    const result = await prisma.image.deleteMany({
      where: {
        id: image.id,
      },
    });
    count += result.count;
  }

  return count;
};

"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";
import { StorageProvider } from "@/types/storageProvider";
import { haveAccess, verifySession } from "@/lib/dal";
import { Claim } from "@/types/claim";
import { SessionUser } from "@/lib/definitions";

export const uploadImages = async (
  productId: string,
  data: FormData,
  provider: StorageProvider = StorageProvider.Azure
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [Claim.AddImage, Claim.ReadProduct, Claim.UpdateProduct],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

  const files: File[] = data.getAll("files") as unknown as File[];

  if (!files || files.length === 0) {
    throw new Error("No file uploaded");
  }
  if (!productId) {
    throw new Error("Images must belong to a product");
  }
  for (let file of files) {
    const image = await prisma.image.create({
      data: {
        cloudLink: "",
        name: file?.name ?? "",
        source: "Manual",
        productId: productId,
      },
    });

    const uploadResult = await storage.uploadFile(file, {
      overwrite: true,
      publicId: image?.providerRef ?? "",
      folder: "shopify",
    });

    if (typeof uploadResult === "undefined") {
      continue;
    }

    await prisma.image.update({
      data: {
        cloudLink: uploadResult.secureUrl,
        provider: provider,
        providerRef: uploadResult.publicId,
        syncStatus: "Synced",
      },
      where: {
        id: image.id,
      },
    });
  }

  return { success: true };
};

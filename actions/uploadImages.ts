"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";
import { StorageProvider } from "@/types/StorageProvider";

export const uploadImages = async (productId: string, data: FormData) => {
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

    let byteArrayBuffer = await new Response(file).arrayBuffer();
    const buffer = Buffer.from(byteArrayBuffer);

    const mime = file.type;
    const encoding = "base64";
    const base64Data = buffer.toString("base64");
    const fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

    const uploadResult = await storage.upload(fileUri, {
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
        provider: StorageProvider.Cloudinary,
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

"use server";

import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";

export const updateMetadata = async (imageId: string, data: FormData) => {
  const file: File = data.get("file") as unknown as File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  const image = await prisma.image.findFirst({
    where: {
      id: imageId,
    },
  });

  let byteArrayBuffer = await new Response(file).arrayBuffer();
  const buffer = Buffer.from(byteArrayBuffer);

  const mime = "image/jpg";
  const encoding = "base64";
  const base64Data = buffer.toString("base64");
  const fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

  const uploadResult = await cloudinary.uploader.upload(fileUri, {
    overwrite: true,
    public_id: image?.providerRef ?? image?.id ?? "",
    folder: "shopify",
  });

  await prisma.image.update({
    data: {
      syncStatus: "Synced",
      cloudLink: uploadResult?.secure_url ?? image?.cloudLink,
    },
    where: {
      id: image?.id,
    },
  });
};

"use server";

import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { CloudProviders } from "@/types/CloudProviders";
import { UploadApiResponse } from "cloudinary";

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
        name: "",
        source: "Manual",
        productId: productId,
      },
    });

    let byteArrayBuffer = await new Response(file).arrayBuffer();
    const buffer = Buffer.from(byteArrayBuffer);

    const uploadResult: UploadApiResponse | undefined = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              overwrite: true,
              filename_override: image.id,
              upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
            },
            (error, uploadResult) => {
              if (!!error) {
                return reject(error);
              }
              return resolve(uploadResult);
            }
          )
          .end(buffer);
      }
    );

    if (typeof uploadResult === "undefined") {
      continue;
    }

    await prisma.image.update({
      data: {
        cloudLink: uploadResult.secure_url,
        provider: CloudProviders.Cloudinary,
        providerRef: uploadResult.public_id,
        syncStatus: "Synced",
      },
      where: {
        id: image.id,
      },
    });
  }

  return { success: true };
};

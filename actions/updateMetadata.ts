"use server";

import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { UploadApiResponse } from "cloudinary";

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

  const uploadResult: UploadApiResponse | undefined = await new Promise(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            overwrite: true,
            public_id: image?.providerRef ?? "",
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

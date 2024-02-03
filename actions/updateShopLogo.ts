"use server";

import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { UploadApiResponse } from "cloudinary";

export interface UpdateShopLogoFormFields {
  maskImageId: string;
  maskObjectX: number;
  maskObjectY: number;
  maskObjectScale: number;
}

export const updateShopLogo = async (
  shopId: string,
  data: UpdateShopLogoFormFields,
  formData: FormData
) => {
  const file: File = formData.get("file") as unknown as File;

  let imageSrc: string | undefined = undefined;
  if (String(file) !== "undefined") {
    let byteArrayBuffer = await new Response(file).arrayBuffer();
    const buffer = Buffer.from(byteArrayBuffer);

    const uploadResult: UploadApiResponse | undefined = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              overwrite: true,
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
    imageSrc = uploadResult?.secure_url;
  }

  const shop = await prisma.shopMaskImage.upsert({
    where: {
      id: data.maskImageId,
    },
    update: {
      positionX: data.maskObjectX,
      positionY: data.maskObjectY,
      scale: data.maskObjectScale,
      ...(typeof imageSrc === "undefined" ? {} : { src: imageSrc }),
    },
    create: {
      positionX: data.maskObjectX,
      positionY: data.maskObjectY,
      scale: data.maskObjectScale,
      src: imageSrc ?? "",
      shopId: shopId,
    },
  });
  return shop;
};

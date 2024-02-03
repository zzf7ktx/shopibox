"use server";

import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { UploadApiResponse } from "cloudinary";

export interface AddShopFormFields {
  name: string;
  shopDomain: string;
  apiKey: string;
  maskObjectX: number;
  maskObjectY: number;
  maskObjectScale: number;
}

export const addShop = async (data: AddShopFormFields, formData: FormData) => {
  const file: File = formData.get("file") as unknown as File;

  if (!file) {
    throw new Error("No file uploaded");
  }

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

  const shop = await prisma.shop.create({
    data: {
      name: data.name,
      apiKey: data.apiKey,
      shopDomain: data.shopDomain,
      maskImages: {
        create: {
          positionX: data.maskObjectX,
          positionY: data.maskObjectY,
          scale: data.maskObjectScale,
          src: uploadResult?.secure_url ?? "",
        },
      },
    },
  });
  return shop;
};

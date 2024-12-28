"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";

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

  const shop = await prisma.shop.create({
    data: {
      name: data.name,
      shopDomain: data.shopDomain,
      credential: {
        create: {
          shopDomain: data.shopDomain,
          apiKey: data.apiKey,
        },
      },
      maskImages: {
        create: {
          positionX: data.maskObjectX,
          positionY: data.maskObjectY,
          scale: data.maskObjectScale,
          src: "",
        },
      },
    },
    include: {
      maskImages: true,
    },
  });

  let uploadResult;
  if (!!file && typeof file === "object") {
    let byteArrayBuffer = await new Response(file).arrayBuffer();
    const buffer = Buffer.from(byteArrayBuffer);

    const mime = file.type;
    const encoding = "base64";
    const base64Data = buffer.toString("base64");
    const fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

    uploadResult = await storage.upload(fileUri, {
      overwrite: true,
      publicId: shop.maskImages?.[0]?.id ?? shop.id,
      folder: `shopify/${shop.id}`,
    });
  }

  const updatedShop = prisma.shop.update({
    where: {
      id: shop.id,
    },
    data: {
      maskImages: {
        update: {
          where: {
            id: shop.maskImages?.[0]?.id,
          },
          data: {
            src: uploadResult?.secureUrl ?? "",
          },
        },
      },
    },
    include: {
      maskImages: true,
    },
  });

  return updatedShop;
};

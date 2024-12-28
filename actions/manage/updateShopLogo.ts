"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";

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
  const shop = await prisma.shop.findFirst({
    where: { id: shopId },
    include: {
      maskImages: true,
    },
  });

  if (!shop) {
    return;
  }

  let imageSrc: string | undefined = undefined;
  if (String(file) !== "undefined") {
    let byteArrayBuffer = await new Response(file).arrayBuffer();
    const buffer = Buffer.from(byteArrayBuffer);

    const mime = "image/jpg";
    const encoding = "base64";
    const base64Data = buffer.toString("base64");
    const fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

    const uploadResult = await storage.upload(fileUri, {
      overwrite: true,
      publicId: shop.maskImages?.[0]?.id ?? shop.id,
      folder: `shopify/${shopId}`,
    });

    imageSrc = uploadResult?.secureUrl;
  }

  const updateShop = await prisma.shopMaskImage.upsert({
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
  return updateShop;
};

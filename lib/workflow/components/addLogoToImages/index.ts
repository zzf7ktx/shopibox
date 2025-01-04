import axios from "axios";
import { syncImage } from "@/actions/manage";
import sharp from "sharp";
import register, { code } from "./register";
import { Input } from "../../types/input";
import { ProductDto } from "../../types/productDto";
import prisma from "@/lib/prisma";
import storage from "@/lib/storage";
import { getInput } from "../../utils/getInput";
import { blobToFile } from "@/utils/blobToFile";
import { StorageProvider } from "@/types/storageProvider";

const run = async (products: ProductDto[], inputs: Input[]) => {
  const shopId = getInput(register.parameters[0], inputs[0]) as string;
  const x = getInput(register.parameters[1], inputs[1]) as number;
  const y = getInput(register.parameters[2], inputs[2]) as number;
  const scale = getInput(register.parameters[3], inputs[3]) as number;

  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    select: {
      id: true,
      images: {
        where: {
          productId: null,
        },
      },
    },
  });

  const logoSrc = shop?.images?.[0]?.cloudLink;

  if (!logoSrc) {
    return products;
  }

  const logoImageBuffer = (
    await axios({ url: logoSrc, responseType: "arraybuffer" })
  ).data as Buffer;

  for (const product of products) {
    for (let img of product.images) {
      if (!img.cloudLink) {
        const res = await syncImage(img.id, "default");
        img.cloudLink = res.url ?? "";
      }

      const imageBuffer = (
        await axios({
          url: img.cloudLink ?? img.backupLink,
          responseType: "arraybuffer",
        })
      ).data as Buffer;

      const image = sharp(imageBuffer);
      const imageMeta = await image.metadata();
      const imageWidth = imageMeta.width ?? 0;
      const imageHeight = imageMeta.height ?? 0;

      const maskImage = sharp(logoImageBuffer);
      const maskImageResized = await maskImage
        .resize(
          Math.round((imageWidth * scale) / 100),
          Math.round((imageHeight * scale) / 100)
        )
        .toBuffer({ resolveWithObject: true });
      image.composite([
        {
          input: maskImageResized.data,
          top: Math.round((y * imageHeight) / 500),
          left: Math.round((x * imageWidth) / 500),
        },
      ]);

      const newImageBuffer = await image.toBuffer();
      const blob = new Blob([newImageBuffer], { type: "image/jpg" });

      const newFile = blobToFile(blob, "product-image-logo.jpg");

      const uploadResult = await storage.uploadFile(newFile, {
        overwrite: true,
        publicId: "",
        folder: `shopify/${shop.id}`,
      });

      img.cloudLink = uploadResult.secureUrl;
      await prisma.image.create({
        data: {
          shopId,
          productId: product.id,
          cloudLink: uploadResult.secureUrl,
          providerRef: uploadResult.publicId,
          name: img.name,
          source: "Auto",
          syncStatus: "Synced",
          provider: StorageProvider.Azure,
        },
      });
    }
  }

  return products;
};

const component = {
  run,
  code,
};

export default component;

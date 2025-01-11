import axios from "axios";
import sharp from "sharp";
import register, { code } from "./register";
import { Input } from "../../types/input";
import { ProductDto } from "../../types/productDto";
import prisma from "@/lib/prisma";
import { getInput } from "../../utils/getInput";
import { syncImage } from "@/lib/syncImage";

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
      let imageBuffer: Buffer;
      if ((img.cloudLink as any) instanceof Buffer) {
        imageBuffer = img.cloudLink as unknown as Buffer;
      } else {
        if (!img.cloudLink) {
          const res = await syncImage(img.id);
          img.cloudLink = res.url ?? "";
        }

        imageBuffer = (
          await axios({
            url: img.cloudLink ?? img.backupLink,
            responseType: "arraybuffer",
          })
        ).data as Buffer;
      }

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

      img.cloudLink = newImageBuffer as any;
    }
  }

  return products;
};

const component = {
  run,
  code,
};

export default component;

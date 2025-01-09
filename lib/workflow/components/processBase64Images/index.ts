import { Input } from "../../types/input";
import { ProductDto } from "../../types/productDto";
import storage from "@/lib/storage";
import { StorageProvider } from "@/types/storageProvider";
import { code, parameters } from "./register";
import { getInput } from "../../utils/getInput";
import { bufferToDataUri, uriToFile } from "@/lib/utils";
import prisma from "@/lib/prisma";

const run = async (products: ProductDto[], inputs: Input[]) => {
  const shopId = getInput(parameters[0], inputs[0]) as string;

  for (const product of products) {
    for (const img of product.images) {
      if (!((img.cloudLink as any) instanceof Buffer)) {
        continue;
      }

      const uri = await bufferToDataUri(img.cloudLink as unknown as Buffer);
      const newFile = await uriToFile(uri, "processed_file");

      let folder = "shopify";

      if (!!shopId) {
        folder = `shopify/${shopId}`;
      }

      const uploadResult = await storage.uploadFile(newFile, {
        folder,
        overwrite: true,
        publicId: "",
      });

      img.cloudLink = uploadResult.secureUrl;

      await prisma.image.upsert({
        where: {
          providerRef: uploadResult.publicId,
        },
        create: {
          cloudLink: uploadResult.secureUrl,
          name: img.name,
          source: "Auto",
          shopId: shopId,
          productId: product.id,
          syncStatus: "Synced",
          providerRef: uploadResult.publicId,
          provider: StorageProvider.Azure,
        },
        update: {
          cloudLink: uploadResult.secureUrl,
          name: img.name,
          source: "Auto",
          shopId: shopId,
          productId: product.id,
          syncStatus: "Synced",
          providerRef: uploadResult.publicId,
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

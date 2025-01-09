import { Input } from "../../types/input";
import { ProductDto } from "../../types/productDto";
import storage from "@/lib/storage";
import { StorageProvider } from "@/types/storageProvider";
import { htmlToImage } from "@/lib/htmlToImage";
import { Image } from "@prisma/client";
import { code } from "./register";
import { bufferToDataUri } from "@/lib/utils";

const run = async (products: ProductDto[], inputs: Input[]) => {
  for (const product of products) {
    if (!product.guideHtml) {
      continue;
    }

    const imageBuffer = await htmlToImage(product.guideHtml);

    if (!imageBuffer) {
      continue;
    }

    const imageUri = imageBuffer as any;

    const guideImage: Image = {
      id: "",
      name: "guide",
      productId: product.id,
      cloudLink: imageUri,
      syncStatus: "Synced",
      provider: StorageProvider.Azure,
      providerRef: `shopify/products/${product.id}`,
      source: "Auto",
      sourceLink: "",
      shopId: null,
      backupLink: "",
      productVariationId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    product.images.push(guideImage);
  }

  return products;
};

const component = {
  run,
  code,
};

export default component;

import { Input } from "../../types/input";
import { ProductDto } from "../../types/productDto";
import storage from "@/lib/storage";
import { StorageProvider } from "@/types/storageProvider";
import { htmlToImage } from "@/lib/htmlToImage";
import { Image } from "@prisma/client";
import { code } from "./register";

const run = async (products: ProductDto[], inputs: Input[]) => {
  for (const product of products) {
    if (!product.guideHtml) {
      continue;
    }

    const imageFile = await htmlToImage(product.guideHtml);

    if (!imageFile) {
      continue;
    }

    const uploadResult = await storage.uploadFile(imageFile, {
      overwrite: true,
      publicId: "",
      folder: `shopify/products/${product.id}`,
    });

    const guideImage: Image = {
      id: "",
      name: "guide",
      productId: product.id,
      cloudLink: uploadResult.secureUrl,
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

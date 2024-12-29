import { ShopProvider } from "@/types/shopProvider";
import { Prisma, ShopCredentials } from "@prisma/client";
import shopify from "./shopify";
import woo from "./woo";

export type ProductDto = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    collections: {
      include: {
        collection: true;
      };
    };
  };
}>;

export type Credentials = ShopCredentials;

const uploadProduct = (
  product: ProductDto,
  credentials: Credentials,
  provider: ShopProvider
) => {
  switch (provider) {
    case ShopProvider.Shopify:
      return shopify.uploadProduct(product, credentials);
    case ShopProvider.Woo:
      return woo.uploadProduct(product, credentials);
  }
};

const uploadProductMany = (
  products: ProductDto[],
  credentials: Credentials,
  provider: ShopProvider
) => {
  switch (provider) {
    case ShopProvider.Shopify:
      return shopify.uploadProductMany(products, credentials);
    case ShopProvider.Woo:
      return woo.uploadProductMany(products, credentials);
  }
};

const shopProvider = {
  uploadProduct,
  uploadProductMany,
};

export default shopProvider;

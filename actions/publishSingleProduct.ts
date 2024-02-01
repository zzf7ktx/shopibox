"use server";

import getShopifyClient from "@/lib/shopify";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

type ProductDto = Prisma.ProductGetPayload<{
  include: {
    images: true;
  };
}>;

export const publishSingleProduct = async (
  shopId: string,
  productId: string
) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      products: {
        where: {
          productId,
        },
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!shop) {
    return { success: false };
  }

  const shopifyClient = getShopifyClient(shop.shopDomain, shop.apiKey ?? "");

  const createProduct = `
    mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input) {
        product {
          id
          title
          variants(first: 10) {
            edges {
              node {
                id
                title
                inventoryQuantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const result = await shopifyClient.request(createProduct);

  if (result.data?.productCreate?.userErrors?.length > 0) {
    return { success: false };
  }

  await prisma.productsOnShops.update({
    where: {
      shopId_productId: {
        shopId,
        productId,
      },
    },
    data: {
      status: "Published",
    },
  });

  return { success: true };
};

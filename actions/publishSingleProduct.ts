"use server";

import getShopifyClient from "@/lib/shopify";
import prisma from "@/lib/prisma";


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

  if (
    !shop ||
    shop.products.length === 0 ||
    shop.products[0].status !== "NotPublished"
  ) {
    return { success: false };
  }

  const shopifyClient = getShopifyClient(shop.shopDomain, shop.apiKey ?? "");

  const createProduct = `
    mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
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

  const product = shop.products[0].product;

  const result = await shopifyClient.request(createProduct, {
    variables: {
      input: {
        title: product.name,
        descriptionHtml: product.descriptionHtml,
        productType: product.category,
      },
      media: product.images.map((img) => ({
        alt: img.name,
        originalSource: img.cloudLink ?? img.backupLink ?? img.sourceLink,
        mediaContentType: "IMAGE",
      })),
    },
  });

  if (!!result.errors || result.data?.productCreate?.userErrors?.length > 0) {
    throw (
      result.errors ??
      new Error(JSON.stringify(result.data?.productCreate?.userErrors))
    );
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

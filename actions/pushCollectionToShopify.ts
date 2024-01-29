"use server";

import getShopifyClient from "@/lib/shopify";
import axios from "axios";
import FormData from "form-data";
import { randomUUID } from "crypto";
import { Prisma, Product } from "@prisma/client";
import prisma from "@/lib/prisma";

type ProductDto = Prisma.ProductGetPayload<{
  include: {
    images: true;
  };
}>;

const buildBulkCreateProductJsonl = (products: ProductDto[]) => {
  let stringJsonl = "";
  for (let product of products) {
    const imgStrings = product.images.map((img) => {
      return `{ "alt": "${img.name}", "originalSource": "${
        img.cloudLink ?? img.backupLink
      }", "mediaContentType": "IMAGE" }`;
    });
    const media = `[ ${imgStrings.join(", ")} ]`;
    const input = `{ "title": "${product.name}", "descriptionHtml": "${product.descriptionHtml}", "productType": "${product.category}" }`;
    stringJsonl += `{ "input": ${input}, "media": ${media} }\n`;
  }
  return stringJsonl;
};

export const pushCollectionToShopify = async (
  shopId: string,
  collectionId: string
) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      collections: {
        where: {
          collectionId: collectionId,
        },
        include: {
          collection: {
            include: {
              products: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                },
              },
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

  const stringJsonl = buildBulkCreateProductJsonl(
    shop.collections[0].collection.products.map((p) => p.product)
  );

  const filename = randomUUID();
  const stagedUploadsCreate = `
    mutation {
      stagedUploadsCreate(
        input: {
          resource: BULK_MUTATION_VARIABLES
          filename: "${filename}"
          mimeType: "text/jsonl"
          httpMethod: POST
        }
      ) {
        userErrors {
          field
          message
        }
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
      }
    }
  `;

  const { data, errors, extensions } = await shopifyClient.request(
    stagedUploadsCreate
  );

  const [{ url, parameters }] = data.stagedUploadsCreate.stagedTargets;

  const formData = new FormData();

  parameters.forEach(({ name, value }: { name: string; value: string }) => {
    formData.append(name, value);
  });

  const file = Buffer.from(stringJsonl);

  formData.append("file", file);

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
  } catch (error) {
    console.log(error);
  }

  const stagedUploadPath: string =
    parameters?.find((p: any) => p?.name === "key")?.value ?? "";

  const importProducts = `
  mutation {
    bulkOperationRunMutation(
      mutation: "mutation call($input: ProductInput!, $media: [CreateMediaInput!]) { productCreate(input: $input, media: $media) { product {id title variants(first: 10) {edges {node {id title inventoryQuantity }}}} userErrors { message field } } }",
      stagedUploadPath: "${stagedUploadPath}") {
      bulkOperation {
        id
        url
        status
      }
      userErrors {
        message
        field
      }
    }
  }`;

  const result = await shopifyClient.request(importProducts);

  if (result.data?.bulkOperationRunMutation?.userErrors?.length > 0) {
    return { success: false };
  }

  await prisma.collectionsOnShops.update({
    where: {
      shopId_collectionId: {
        shopId: shopId,
        collectionId: collectionId,
      },
    },
    data: {
      noPushedProducts: shop.collections[0].collection.products.length,
    },
  });

  return { success: true };
};

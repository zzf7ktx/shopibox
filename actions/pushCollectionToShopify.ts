"use server";

import getShopifyClient from "@/lib/shopify";
import axios from "axios";
import FormData from "form-data";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

type ProductDto = Prisma.ProductGetPayload<{
  include: {
    images: true;
  };
}>;

const buildBulkCreateProductJsonl = (products: ProductDto[]) => {
  let stringJsonl = "";
  for (let product of products) {
    const media = product.images.map((img) => ({
      alt: img.name,
      originalSource: img.cloudLink ?? img.backupLink ?? img.sourceLink,
      mediaContentType: "IMAGE",
    }));
    const input = {
      title: product.name,
      descriptionHtml: product.descriptionHtml,
      productType: product.category,
    };
    stringJsonl += `{ "input": ${JSON.stringify(
      input
    )}, "media": ${JSON.stringify(media)} }\n`;
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
      products: {
        where: {
          status: "NotPublished",
          product: {
            collections: {
              some: {
                collectionId: collectionId,
              },
            },
          },
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

  if (!shop || shop.products.length === 0) {
    return { success: false };
  }

  const shopifyClient = getShopifyClient(shop.shopDomain, shop.apiKey ?? "");

  const stringJsonl = buildBulkCreateProductJsonl(
    shop.products.map((p) => p.product)
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

  if(!!errors) {
    throw errors
  }

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
    throw new Error(
      JSON.stringify(result.data.bulkOperationRunMutation.userErrors)
    );
  }

  await prisma.productsOnShops.updateMany({
    where: {
      shopId: shopId,
      productId: {
        in: shop.products.map((p) => p.productId),
      },
    },
    data: {
      status: "Published",
    },
  });

  return { success: true };
};

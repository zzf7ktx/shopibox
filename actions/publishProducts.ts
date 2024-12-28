"use server";

import getShopifyClient from "@/lib/shopify";
import axios from "axios";
import FormData from "form-data";
import { randomUUID } from "crypto";
import { Prisma, ShopStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import storage from "@/lib/storage";
import { cartesian, groupByKey } from "@/utils";
import { syncImageWithMainProvider } from ".";
import { rewriteProductTitles } from "./rewriteProductTitle";

type ProductDto = Prisma.ProductGetPayload<{
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

const buildBulkCreateProductJsonl = async (
  products: ProductDto[],
  collectionMap: { [key: string]: string },
  locationIds: { id: string }[],
  shopInfo: Prisma.ShopGetPayload<{
    include: {
      maskImages: true;
    };
  }>
) => {
  let stringJsonl = "";
  for (let product of products) {
    let media: any[] = [];
    const shopMaskImage = shopInfo.maskImages[0];
    if (!!shopMaskImage?.src) {
      for (let img of product.images) {
        if (!img.cloudLink) {
          const res = await syncImageWithMainProvider(img.id, "default");
          img.cloudLink = res.url ?? "";
        }
        const imageInput = (
          await axios({
            url: img.cloudLink ?? img.backupLink,
            responseType: "arraybuffer",
          })
        ).data as Buffer;

        const maskImageInput = (
          await axios({ url: shopMaskImage.src, responseType: "arraybuffer" })
        ).data as Buffer;
        const image = sharp(imageInput);
        const imageMeta = await image.metadata();
        const imageWidth = imageMeta.width ?? 0;
        const imageHeight = imageMeta.height ?? 0;

        const maskImage = sharp(maskImageInput);
        const maskImageResized = await maskImage
          .resize(
            Math.round((imageWidth * shopMaskImage.scale) / 100),
            Math.round((imageHeight * shopMaskImage.scale) / 100)
          )
          .toBuffer({ resolveWithObject: true });
        image.composite([
          {
            input: maskImageResized.data,
            top: Math.round((shopMaskImage.positionY * imageHeight) / 500),
            left: Math.round((shopMaskImage.positionX * imageWidth) / 500),
          },
        ]);
        const newImageBuffer = await image.toBuffer();

        const mime = "image/jpg";
        const encoding = "base64";
        const base64Data = newImageBuffer.toString("base64");
        const fileUri = "data:" + mime + ";" + encoding + "," + base64Data;

        const uploadResult = await storage.upload(fileUri, {
          overwrite: true,
          publicId: img.providerRef ?? img.id,
          folder: `shopify/${shopInfo.id}`,
        });

        media.push({
          alt: img.name,
          originalSource: uploadResult?.secureUrl ?? img.cloudLink,
          mediaContentType: "IMAGE",
        });
      }
    } else {
      media = [];
      for (let img of product.images) {
        if (!img.cloudLink) {
          try {
            const res = await syncImageWithMainProvider(img.id, "default");
            img.cloudLink = res.url ?? "";
          } catch (error) {
            img.cloudLink = img.sourceLink ?? "";
          }
        }

        media.push({
          alt: img.name,
          originalSource: img.cloudLink,
          mediaContentType: "IMAGE",
        });
      }
    }

    let names = new Set();
    for (let variant of product.variants ?? []) {
      names.add(variant.key);
    }

    let variants =
      !product?.variants || product?.variants.length === 0
        ? []
        : cartesian(
            ...groupByKey(product.variants ?? []).map((v) => v.values)
          ).map((v) => ({
            options: v,
            price: product.price ?? 0,
            inventoryItem: {
              tracked: true,
            },
            inventoryPolicy: "CONTINUE",
            inventoryQuantities: locationIds.map((l) => ({
              availableQuantity: 10000000,
              locationId: l.id ?? 0,
            })),
            taxable: false,
          }));

    const input = {
      title: product.name,
      descriptionHtml: product.descriptionHtml,
      productType: product.category,
      options: Array.from(names),
      variants: variants,
      collectionsToJoin: (product?.collections ?? []).map(
        (collection) => collectionMap[collection.collection.name]
      ),
    };
    stringJsonl += `{ "input": ${JSON.stringify(
      input
    )}, "media": ${JSON.stringify(media)} }\n`;
  }
  return stringJsonl;
};

export const publishProducts = async (
  shopId: string,
  productIds: string[],
  autoRewriteTitle: boolean = false
) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      credential: true,
      maskImages: true,
      products: {
        where: {
          status: "NotPublished",
          productId: {
            in: productIds,
          },
        },
        include: {
          product: {
            include: {
              images: true,
              variants: true,
              collections: {
                include: {
                  collection: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!shop) {
    return { success: false, data: "Shop is not exist" };
  }

  if (shop.products.length === 0) {
    return { success: false, data: "There is no products in shop" };
  }

  if (shop.status != ShopStatus.Active) {
    return { success: false, data: "Shop is not active" };
  }

  // Temp: Rewrite products title including collection name
  if (autoRewriteTitle) {
    const rewrote = await rewriteProductTitles(
      shop.products.map((p) => p.product)
    );
    for (let i = 0; i < shop.products.length; i++) {
      const reProduct = rewrote.find(
        (r) => r.id == shop.products[i].product.id
      );

      shop.products[i].product.name =
        reProduct?.name ?? shop.products[i].product.name;
    }
  }

  const shopifyClient = getShopifyClient(
    shop.shopDomain,
    shop.credential.apiKey ?? ""
  );

  let allProductCollections: { title: string; description: string | null }[] =
    [];
  for (let product of shop.products) {
    for (let collection of product.product?.collections ?? []) {
      if (
        !allProductCollections.some(
          (c) => c.title === collection.collection.name
        )
      ) {
        allProductCollections.push({
          title: collection.collection.name,
          description: collection.collection.description,
        });
      }
    }
  }

  const getCollectionResponse = await shopifyClient.fetch(`
    query {
      collections(first: 5) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `);

  let shopifyCollections: {
    id: string;
    title: string;
  }[] = (await getCollectionResponse.json()).data.collections.edges.map(
    (e: any) => e.node
  );

  let collectionsToJoinMap: { [key: string]: string } = {};
  for (let productCollection of allProductCollections) {
    let collectionInfo = shopifyCollections.find(
      (sc) => sc.title === productCollection.title
    );
    if (!collectionInfo) {
      const createCollectionQuery = `
        mutation collectionCreate($input: CollectionInput!) {
          collectionCreate(input: $input) {
            collection {
              id
              title
              descriptionHtml
              handle
              sortOrder
            }
            userErrors {
              field
              message
            }
          }
        }
      `;
      const result = await shopifyClient.request(createCollectionQuery, {
        variables: {
          input: {
            title: productCollection.title,
            descriptionHtml: productCollection.description,
          },
        },
      });

      collectionsToJoinMap[productCollection.title] =
        result.data.collectionCreate.collection.id;
    } else {
      collectionsToJoinMap[productCollection.title] = collectionInfo.id;
    }
  }

  const getLocationResponse = await shopifyClient.fetch(`
  query {
    locations(first: 1) {
      edges {
        node {
          id
        }
      }
    }
  }
`);

  let locations = (await getLocationResponse.json()).data?.locations?.edges;

  const stringJsonl = await buildBulkCreateProductJsonl(
    shop.products.map((p) => p.product),
    collectionsToJoinMap,
    locations?.length > 0
      ? [
          {
            id: locations[0]?.node?.id ?? 0,
          },
        ]
      : [],
    shop
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

  return { success: true, data: { no: shop.products.length, result: result } };
};

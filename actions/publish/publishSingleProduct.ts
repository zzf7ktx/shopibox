"use server";

import getShopifyClient from "@/lib/shopify";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import storage from "@/lib/storage";
import axios from "axios";
import { cartesian, groupByKey } from "@/utils";
import { syncImageWithMainProvider } from "..";
import { ShopStatus } from "@prisma/client";

export const publishSingleProduct = async (
  shopId: string,
  productId: string
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
          productId,
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

  if (shop.products[0].status !== "NotPublished") {
    return { success: false, data: "Product is not published yet" };
  }

  const shopifyClient = getShopifyClient(
    shop.shopDomain,
    shop.credential.apiKey ?? ""
  );

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

  let productCollections = (shop.products[0].product?.collections ?? []).map(
    (c) => ({
      title: c.collection.name,
      description: c.collection.description,
    })
  );

  let collectionsToJoin: string[] = [];

  for (let productCollection of productCollections) {
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
      collectionsToJoin.push(result.data.collectionCreate.collection.id);
    } else {
      collectionsToJoin.push(collectionInfo.id);
    }
  }

  const createProduct = `
    mutation ProductCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
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
  let media: any[] = [];
  const shopMaskImage = shop.maskImages[0];
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
        folder: `shopify/${shopId}`,
      });
      media = [];
      for (let img of product.images) {
        if (!img.cloudLink) {
          const res = await syncImageWithMainProvider(img.id, "default");
          img.cloudLink = res.url ?? "";
        }

        media.push({
          alt: img.name,
          originalSource: img.cloudLink,
          mediaContentType: "IMAGE",
        });
      }
    }
  } else {
    media = product.images.map((img) => ({
      alt: img.name,
      originalSource: img.cloudLink ?? img.backupLink ?? img.sourceLink,
      mediaContentType: "IMAGE",
    }));
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

  let names = new Set();
  for (let variant of shop.products[0].product.variants ?? []) {
    names.add(variant.key);
  }

  // Temporally solution: fix 10000000 for first location
  let variants =
    !product?.variants || product?.variants.length === 0
      ? []
      : cartesian(
          ...groupByKey(shop.products[0].product.variants ?? []).map(
            (v) => v.values
          )
        ).map((v) => ({
          options: v,
          price: product.price ?? 0,
          inventoryItem: {
            tracked: true,
          },
          taxable: false,
          inventoryPolicy: "CONTINUE",
          inventoryQuantities:
            locations?.length > 0
              ? [
                  {
                    availableQuantity: 10000000,
                    locationId: locations[0]?.node?.id ?? 0,
                  },
                ]
              : [],
        }));
  const result = await shopifyClient.request(createProduct, {
    variables: {
      input: {
        title: product.name,
        descriptionHtml: product.descriptionHtml,
        productType: product.category,
        options: Array.from(names),
        variants: variants,
        collectionsToJoin: collectionsToJoin,
      },
      media,
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

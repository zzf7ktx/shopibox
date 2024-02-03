"use server";

import getShopifyClient from "@/lib/shopify";
import prisma from "@/lib/prisma";
import sharp from "sharp";
import { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import axios from "axios";

export const publishSingleProduct = async (
  shopId: string,
  productId: string
) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      maskImages: true,
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
  let media: any[] = [];
  const shopMaskImage = shop.maskImages[0];
  if (shopMaskImage.src !== "") {
    for (let img of product.images) {
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

      const uploadResult: UploadApiResponse | undefined = await new Promise(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                overwrite: true,
                upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
              },
              (error, uploadResult) => {
                if (!!error) {
                  return reject(error);
                }
                return resolve(uploadResult);
              }
            )
            .end(newImageBuffer);
        }
      );

      media.push({
        alt: img.name,
        originalSource: uploadResult?.secure_url ?? img.cloudLink,
        mediaContentType: "IMAGE",
      });
    }
  } else {
    media = product.images.map((img) => ({
      alt: img.name,
      originalSource: img.cloudLink ?? img.backupLink ?? img.sourceLink,
      mediaContentType: "IMAGE",
    }));
  }

  const result = await shopifyClient.request(createProduct, {
    variables: {
      input: {
        title: product.name,
        descriptionHtml: product.descriptionHtml,
        productType: product.category,
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

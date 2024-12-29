"use server";

import prisma from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";
import { rewriteProductTitles } from "../ml";

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
      credentials: true,
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

  return { success: true, data: { no: shop.products.length } };
};

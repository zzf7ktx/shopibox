"use server";

import prisma from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";
import { run } from "@/lib/workflow/workflow";
import { haveAccess, verifySession } from "@/lib/dal";
import { Claim } from "@/types/claim";
import { SessionUser } from "@/lib/definitions";
import { inngest } from "@/inngest/client";

export const publishProducts = async (shopId: string, productIds: string[]) => {
  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    include: {
      workflow: true,
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
              images: {
                where: {
                  shopId: {
                    equals: null,
                  },
                },
              },
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

  await run(
    shop.products.map((p) => p.product),
    shop.workflowId!
  );

  return { success: true, data: { no: shop.products.length } };
};

export const publishProductsInngest = async (
  shopId: string,
  productIds: string[]
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.PushToShop], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  await inngest.send({
    name: "shop/publish-products",
    data: {
      shopId: shopId,
      productIds: productIds,
    },
  });

  return { success: true, data: "Enqueued" };
};

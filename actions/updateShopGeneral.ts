"use server";

import prisma from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";

export interface UpdateShopGeneralFormFields {
  name?: string;
  shopDomain?: string;
  apiKey?: string;
  status?: ShopStatus;
}

export const updateShopGeneral = async (
  shopId: string,
  data: UpdateShopGeneralFormFields
) => {
  const shop = await prisma.shop.update({
    where: {
      id: shopId,
    },
    data: {
      name: data.name,
      shopDomain: data.shopDomain,
      status: data.status,
      credential: {
        update: {
          shopDomain: data.shopDomain,
          ...(data.apiKey
            ? {
                apiKey: data.apiKey,
              }
            : {}),
        },
      },
    },
  });

  return shop;
};

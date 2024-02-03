"use server";

import prisma from "@/lib/prisma";

export interface UpdateShopGeneralFormFields {
  name?: string;
  shopDomain?: string;
  apiKey?: string;
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
      ...(data.apiKey
        ? {
            apiKey: data.apiKey,
          }
        : {}),
    },
  });
  return shop;
};

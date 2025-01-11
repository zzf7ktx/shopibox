"use server";

import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { ShopStatus } from "@prisma/client";

export interface UpdateShopGeneralFormFields {
  name?: string;
  shopDomain?: string;
  apiKey?: string;
  apiSerect?: string;
  accessToken?: string;
  status?: ShopStatus;
}

export const updateShopGeneral = async (
  shopId: string,
  data: UpdateShopGeneralFormFields
) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadShop, Claim.UpdateShop], userClaims)) {
    return { success: false, data: "Access denied" };
  }

  const shop = await prisma.shop.update({
    where: {
      id: shopId,
    },
    data: {
      name: data.name,
      shopDomain: data.shopDomain,
      status: data.status,
      credentials: {
        updateMany: {
          where: {
            shopId,
          },
          data: {
            shopDomain: data.shopDomain,
            ...(data.apiKey
              ? {
                  apiKey: data.apiKey,
                }
              : {}),
            ...(data.apiSerect
              ? {
                  apiSerect: data.apiSerect,
                }
              : {}),
            ...(data.accessToken
              ? {
                  accessToken: data.accessToken,
                }
              : {}),
          },
        },
      },
    },
  });

  return { success: true, data: shop };
};

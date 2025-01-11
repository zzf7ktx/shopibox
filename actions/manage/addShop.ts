"use server";

import storage from "@/lib/storage";
import prisma from "@/lib/prisma";
import { ShopProvider } from "@/types/shopProvider";
import pushToShopDefault from "@/lib/workflow/templates/pushToShopDefault";
import { setInputValues } from "@/lib/workflow/utils/setInputValues";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";

export interface AddShopFormFields {
  name: string;
  shopDomain: string;
  apiKey: string;
  apiSerect: string;
  accessToken: string;
  provider: ShopProvider;
}

export const addShop = async (data: AddShopFormFields, formData: FormData) => {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (
    !haveAccess(
      [Claim.AddShop, Claim.UpdateShop, Claim.AddImage, Claim.AddWorkflow],
      userClaims
    )
  ) {
    return { success: false, data: "Access denied" };
  }

  const file: File = formData.get("file") as unknown as File;

  const workflowTemplate = await prisma.workflowTemplate.findFirst({
    where: {
      code: pushToShopDefault.code,
    },
    include: {
      steps: {
        include: {
          component: true,
        },
      },
    },
  });

  const shop = await prisma.shop.create({
    data: {
      name: data.name,
      shopDomain: data.shopDomain,
      provider: data.provider,
      credentials: {
        create: {
          shopDomain: data.shopDomain,
          apiKey: data.apiKey,
          apiSerect: data.apiSerect,
          accessToken: data.accessToken,
        },
      },
    },
    include: {
      images: {
        take: 1,
      },
    },
  });

  let uploadResult;
  if (!!file && typeof file === "object") {
    uploadResult = await storage.uploadFile(file, {
      overwrite: true,
      publicId: shop.images.find((i) => !i.productId)?.providerRef ?? "",
      folder: `shopify/${shop.id}`,
    });
  }

  const workflow = await prisma.workflow.create({
    data: {
      steps: {
        createMany: {
          data: (workflowTemplate?.steps ?? []).map((s) => ({
            componentCode: s.componentCode,
            inputValues: setInputValues(
              s.component.parameters,
              s.defaultInputValues,
              "shop",
              shop.id
            ),
            order: s.order,
          })),
        },
      },
    },
  });

  const updatedShop = prisma.shop.update({
    where: {
      id: shop.id,
    },
    data: {
      workflowId: workflow.id,
      images: {
        create: {
          cloudLink: uploadResult?.secureUrl ?? "",
          name: "logo",
          source: "Manual",
          syncStatus: "Synced",
          providerRef: uploadResult?.publicId,
        },
      },
    },
    include: {
      images: true,
    },
  });

  return updatedShop;
};

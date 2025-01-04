import shopProvider from "@/lib/shopProvider";
import { Input } from "../../types/input";
import { ProductDto } from "../../types/productDto";
import { getInput } from "../../utils/getInput";
import register, { code } from "./register";
import prisma from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";
import { ShopProvider } from "@/types/shopProvider";

const run = async (products: ProductDto[], inputs: Input[]) => {
  const shopId = getInput(register.parameters[0], inputs[0]) as string;

  const shop = await prisma.shop.findFirst({
    where: {
      id: shopId,
    },
    select: {
      credentials: true,
      status: true,
      provider: true,
    },
  });

  if (!shop || products.length === 0 || shop.status != ShopStatus.Active) {
    return products;
  }

  await shopProvider.uploadProductMany(
    products,
    shop.credentials[0],
    shop.provider as ShopProvider
  );

  await prisma.productsOnShops.updateMany({
    where: {
      shopId: shopId,
      productId: {
        in: products.map((p) => p.id),
      },
    },
    data: {
      status: "Published",
    },
  });

  return products;
};

const component = {
  run,
  code,
};

export default component;

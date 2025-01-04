import { Prisma } from "@prisma/client";

export type ProductDto = Prisma.ProductGetPayload<{
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

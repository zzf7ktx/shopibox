import ProductTable from "@/components/ProductTable";
import prisma from "@/lib/prisma";

export const revalidate = 0;
export const maxDuration = 60;

export default async function Products() {
  let data = await prisma.product.findMany({
    include: {
      images: {
        where: {
          shopId: {
            equals: null,
          },
        },
      },
      collections: {
        include: {
          collection: true,
        },
      },
      shops: {
        include: {
          shop: true,
        },
      },
      variants: true,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  return <ProductTable data={data} />;
}

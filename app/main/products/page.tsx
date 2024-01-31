import ProductTable from "@/components/ProductTable";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function Products() {
  let data = await prisma.product.findMany({
    include: {
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
    },
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  return <ProductTable data={data} />;
}

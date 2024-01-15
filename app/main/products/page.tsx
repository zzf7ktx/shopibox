import ProductTable from "@/components/ProductTable";
import prisma from "@/lib/prisma";

export default async function Products() {
  let data = await prisma.product.findMany({
    include: {
      collections: {
        include: {
          collection: true,
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

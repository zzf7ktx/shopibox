import ProductTable from "@/components/ProductTable";
import prisma from "@/lib/prisma";

export default async function Products() {
  let data = await prisma.product.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
  });
  return <ProductTable data={data} />;
}

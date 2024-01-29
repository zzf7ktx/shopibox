import ShopCollectionTable from "@/components/ShopCollectionTable";
import prisma from "@/lib/prisma";

export default async function ShopCollectionsPage({
  params,
}: {
  params: { id: string };
}) {
  let data = params.id
    ? await prisma.collection.findMany({
        where: {
          shops: {
            some: {
              shopId: params.id,
            },
          },
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
        include: {
          products: {
            select: {
              productId: true,
            },
          },
          shops: {
            where: {
              shopId: params.id,
            },
            include: {
              shop: true,
            },
          },
        },
      })
    : [];
  return (
    <div className="flex-1 space-y-4 py-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Collections</h2>
        <div className="flex items-center space-x-2"></div>
      </div>
      <ShopCollectionTable data={data} />
    </div>
  );
}

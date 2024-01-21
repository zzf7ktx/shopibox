import ShopTable from "@/components/ShopTable";
import prisma from "@/lib/prisma";

export default async function Collections() {
  let data = await prisma.shop.findMany({
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      name: true,
      syncStatus: true,
      maskImages: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return <ShopTable data={data} />;
}

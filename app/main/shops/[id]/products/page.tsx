import ShopProductTable from "@/components/ShopProductTable";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function ShopProductsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  let data = params?.id
    ? await prisma.product.findMany({
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
          images: true,
          collections: {
            include: {
              collection: true,
            },
          },
          shops: true,
        },
      })
    : [];
  return (
    <div className='flex-1 space-y-4 py-6'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Products</h2>
        <div className='flex items-center space-x-2'></div>
      </div>
      <ShopProductTable data={data} />
    </div>
  );
}

import AddShopModal from "@/components/AddShopModal";
import PageHeader from "@/components/PageHeader";
import ShopTable from "@/components/ShopTable";
import { Button } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";
import prisma from "@/lib/prisma";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export const revalidate = 0;

export default async function Shops() {
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
      status: true,
      provider: true,
      maskImages: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return (
    <>
      <PageHeader
        title='Shops'
        action={
          <AddShopModal
            dialogTrigger={
              <DialogTrigger asChild>
                <Button>
                  <PlusCircledIcon className='mr-2 h-4 w-4' /> Upload
                </Button>
              </DialogTrigger>
            }
          />
        }
      />
      <ShopTable data={data} />
    </>
  );
}

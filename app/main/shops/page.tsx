import AddShopModal from "@/components/AddShopModal";
import PageHeader from "@/components/PageHeader";
import ShopTable from "@/components/ShopTable";
import { Button } from "@/components/ui/Button";
import { DialogTrigger } from "@/components/ui/Dialog";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import prisma from "@/lib/prisma";
import { Claim } from "@/types/claim";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function Shops() {
  const session = await verifySession();

  if (!session.isAuth) {
    redirect("/login");
  }

  const userClaims = (session.user as SessionUser)?.claims ?? [];

  if (!haveAccess([Claim.ReadShop], userClaims)) {
    redirect("/main");
  }

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
      images: true,
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

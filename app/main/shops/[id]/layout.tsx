import { ShopNav } from "@/components/ShopNav";
import ShopStatusSwitcher from "@/components/ShopStatusSwitcher";
import ShopSwitcher from "@/components/ShopSwitcher";
import { haveAccess, verifySession } from "@/lib/dal";
import { SessionUser } from "@/lib/definitions";
import { Claim } from "@/types/claim";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop page",
  description: "Shop page",
};

export default async function ShopDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const userClaims = (session.user as SessionUser)?.claims ?? [];
  const show: string[] = [];

  if (haveAccess([Claim.ReadShop], userClaims)) {
    show.push("overview");
  }

  if (haveAccess([Claim.ReadShop, Claim.ReadProduct], userClaims)) {
    show.push("products");
  }

  if (haveAccess([Claim.ReadShop, Claim.ReadCollection], userClaims)) {
    show.push("collections");
  }

  if (haveAccess([Claim.ReadShop, Claim.UpdateShop], userClaims)) {
    show.push("settings");
  }

  return (
    <>
      <div className='hidden flex-col md:flex'>
        <div className='border-b'>
          <div className='flex items-center pb-2'>
            <ShopSwitcher />
            <ShopNav className='mx-6' show={show} />
            <div className='ml-auto flex items-center space-x-4'>
              {/*TODO: Add search or filter */}
            </div>
            <ShopStatusSwitcher />
          </div>
        </div>
        {children}
      </div>
    </>
  );
}

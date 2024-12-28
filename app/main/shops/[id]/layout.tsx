import { ShopNav } from "@/components/ShopNav";
import ShopStatusSwitcher from "@/components/ShopStatusSwitcher";
import ShopSwitcher from "@/components/ShopSwitcher";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop page",
  description: "Shop page",
};

export default function ShopDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='hidden flex-col md:flex'>
        <div className='border-b'>
          <div className='flex items-center pb-2'>
            <ShopSwitcher />
            <ShopNav className='mx-6' />
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

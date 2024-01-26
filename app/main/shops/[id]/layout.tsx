import { ShopNav } from "@/components/ShopNav";
import ShopSwitcher from "@/components/ShopSwitcher";
import { Metadata } from "next";
import Image from "next/image";

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
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <div className="border-b">
          <div className="flex h-16 items-center">
            <ShopSwitcher />
            <ShopNav className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              {/*TODO: Add search or filter */}
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
}

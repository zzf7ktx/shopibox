import "./shops.css";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import PageHeader from "@/components/PageHeader";
import AddShopModal from "@/components/AddShopModal";
import { DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export const metadata: Metadata = {
  title: "Shop management",
  description: "Shop management",
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Shops"
        action={
          <AddShopModal
            dialogTrigger={
              <DialogTrigger asChild>
                <Button>
                  <PlusCircledIcon className="mr-2 h-4 w-4" /> Upload
                </Button>
              </DialogTrigger>
            }
          />
        }
      />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}

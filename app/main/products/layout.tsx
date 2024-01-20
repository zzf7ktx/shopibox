import "./products.css";
import { Metadata } from "next";
import { Suspense } from "react";
import { DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/PageHeader";
import AddManualProductModal from "@/components/AddManualProductModal";
import Loading from "./loading";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export const metadata: Metadata = {
  title: "Product management",
  description: "Product management",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Products"
        action={
          <AddManualProductModal
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

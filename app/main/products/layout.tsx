import "./products.css";
import { Metadata } from "next";
import { Suspense } from "react";
import { DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/PageHeader";
import AddManualProductModal from "@/components/AddManualProductModal";
import Loading from "./loading";
import { PlusCircledIcon, UploadIcon } from "@radix-ui/react-icons";
import ImportProductModal from "@/components/ImportProductModal";

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
          <div className="flex items-center gap-1">
            <AddManualProductModal
              dialogTrigger={
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircledIcon className="mr-2 h-4 w-4" /> Upload
                  </Button>
                </DialogTrigger>
              }
            />
            <ImportProductModal
              dialogTrigger={
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <UploadIcon className="mr-2 h-4 w-4" /> Import
                  </Button>
                </DialogTrigger>
              }
            />
          </div>
        }
      />
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </>
  );
}

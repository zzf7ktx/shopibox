import "./collections.css";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import PageHeader from "@/components/PageHeader";
import AddManualCollectionModal from "@/components/AddManualCollectionModal";
import { DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { PlusCircledIcon, UploadIcon } from "@radix-ui/react-icons";
import ImportCollectionModal from "@/components/ImportCollectionModal";

export const metadata: Metadata = {
  title: "Collection management",
  description: "Collection management",
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Collections"
        action={
          <div className="flex items-center gap-1">
            <AddManualCollectionModal
              dialogTrigger={
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircledIcon className="mr-2 h-4 w-4" /> Upload
                  </Button>
                </DialogTrigger>
              }
            />
            <ImportCollectionModal
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

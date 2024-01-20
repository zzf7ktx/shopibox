import "./images.css";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "./loading";
import PageHeader from "@/components/PageHeader";
import UploadManualModal from "@/components/UploadManualModal";
import { DialogTrigger } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { PlusCircledIcon } from "@radix-ui/react-icons";

export const metadata: Metadata = {
  title: "Image management",
  description: "Image management",
};

export default function ImagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader
        title="Images"
        action={
          <UploadManualModal
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

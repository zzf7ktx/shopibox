"use client";

import { ReactNode, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import UpdateProductModalVariants from "./UpdateProductModalVariants";
import UpdateProductModalBasic from "./UpdateProductModalBasic";

export enum UpdateProductDialogs {
  ProductInfo = "ProductInfo",
  ProductVariants = "ProductVariants",
}

export interface UpdateProductModalProps {
  dialogTrigger: ReactNode;
  productId: string;
  dialog?: UpdateProductDialogs;
}

export default function UpdateProductModal({
  dialogTrigger,
  productId,
  dialog,
}: UpdateProductModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const onOpenChange = (newValue: boolean) => {
    setOpen(newValue);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogTrigger}
        <DialogContent className="max-h-[80%] overflow-y-auto">
          {dialog === UpdateProductDialogs.ProductVariants ? (
            <UpdateProductModalVariants
              productId={productId}
              open={open}
              setOpen={setOpen}
            />
          ) : (
            <UpdateProductModalBasic
              productId={productId}
              open={open}
              setOpen={setOpen}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

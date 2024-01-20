"use client";
import { Button } from "antd";
import { useState } from "react";
import AddManualProductModal from "./AddManualProductModal";
import { Product } from "@prisma/client";

export interface AddManualProductButtonProps {}

export default function AddManualProductButton() {
  const [open, setOpen] = useState<boolean>(false);
  const [openImageStep, setOpenImageStep] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState<Product | null>(null);

  const handleClose = (value?: Product) => {
    setOpen(false);
    if (!!value) {
      setNewProduct(value);
      setOpenImageStep(true);
    }
  };
  return (
    <>
      <Button onClick={() => setOpen((prev) => !prev)}>Upload Manual</Button>
      <AddManualProductModal open={open} onClose={handleClose} />
    </>
  );
}

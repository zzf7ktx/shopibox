"use client";
import { Button } from "antd";
import AddManualCollectionButtonModal from "./AddManualCollectionModal";
import { useState } from "react";
import { Collection } from "@prisma/client";

export interface AddManualCollectionButtonProps {}

export default function AddManualCollectionButton({}: AddManualCollectionButtonProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [newCollection, setNewCollection] = useState<Collection | null>(null);

  const handleClose = (value?: Collection) => {
    setOpen(false);
    if (!!value) {
      setNewCollection(value);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen((prev) => !prev)}>Upload Manual</Button>
      <AddManualCollectionButtonModal open={open} onClose={handleClose} />
    </>
  );
}

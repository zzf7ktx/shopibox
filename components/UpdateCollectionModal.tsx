"use client";

import { ReactNode, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import UpdateCollectionModalBasic from "./UpdateCollectionModalBasic";

export enum UpdateCollectionDialogs {
  CollectionInfo = "CollectionInfo",
}

export interface UpdateCollectionModalProps {
  dialogTrigger: ReactNode;
  collectionId: string;
  dialog?: UpdateCollectionDialogs;
}

export default function UpdateCollectionModal({
  dialogTrigger,
  collectionId,
  dialog = UpdateCollectionDialogs.CollectionInfo,
}: UpdateCollectionModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const onOpenChange = (newValue: boolean) => {
    setOpen(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}
      <DialogContent className="max-h-[80%] overflow-y-auto">
        {dialog === UpdateCollectionDialogs.CollectionInfo ? (
          <UpdateCollectionModalBasic
            collectionId={collectionId}
            open={open}
            setOpen={setOpen}
          />
        ) : (
          <div></div>
        )}
      </DialogContent>
    </Dialog>
  );
}

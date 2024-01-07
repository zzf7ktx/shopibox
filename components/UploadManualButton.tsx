"use client";
import { Button } from "antd";
import UploadManualModal from "./UploadManualModal";
import { useState } from "react";

export interface UploadManualButtonProps {}

export default function UploadManualButton() {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <Button onClick={() => setOpen(prev => !prev)}>Upload Manual</Button>
      <UploadManualModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

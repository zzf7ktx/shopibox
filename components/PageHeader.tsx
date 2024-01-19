"use client";
import { useRouter } from "next/navigation";
import { ReactNode, startTransition } from "react";
import { TypographyH4 } from "./ui/Typography";
import { Button } from "./ui/Button";
import { IoSync } from "react-icons/io5";

export interface PageHeaderProps {
  title: ReactNode;
  action?: ReactNode;
}

export default function PageHeader({ title, action }: PageHeaderProps) {
  const router = useRouter();
  const handleRefresh = async () => {
    startTransition(() => router.refresh());
  };
  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex space-x-1 items-center">
        <TypographyH4>{title}</TypographyH4>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <IoSync />
        </Button>
      </div>
      {action}
    </div>
  );
}

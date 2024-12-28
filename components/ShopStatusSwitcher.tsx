"use client";

import { useEffect, useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { Prisma, ShopStatus } from "@prisma/client";
import { getShop, updateShopGeneral } from "@/actions/manage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/DropdownMenu";
import { Button } from "./ui/Button";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { toast } from "./ui/useToast";

type Option = {
  label: string;
  value: ShopStatus;
  icon: React.ComponentType<{ className?: string }>;
};

type ShopDto = Prisma.ShopGetPayload<{
  select: {
    id: true;
    name: true;
    syncStatus: true;
    status: true;
    provider: true;
    maskImages: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

interface ShopStatusSwitcherProps {
  className?: string;
}

export default function ShopStatusSwitcher({
  className,
}: ShopStatusSwitcherProps) {
  const statuses = Object.entries(ShopStatus).map(([key, value]) => ({
    label: key,
    value: value,
    icon:
      value === ShopStatus.Active
        ? CheckCircledIcon
        : value === ShopStatus.Closed
        ? CrossCircledIcon
        : ReaderIcon,
  }));

  const [selected, setSelected] = useState<Option>(statuses[0]);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();

  useEffect(() => {
    const init = async () => {
      if (!id) {
        return;
      }
      const shop = await getShop(id as string);
      setSelected(statuses.find((s) => s.value == shop?.status) ?? statuses[0]);
      setLoading(false);
    };

    init();
  }, [id, statuses]);

  const setStatus = async (status: ShopStatus) => {
    console.log("here");
    try {
      setLoading(true);
      const updatedShop = await updateShopGeneral(id as string, { status });
      console.log(updatedShop);
      setSelected(
        (prev) => statuses.find((s) => s.value === updatedShop.status) ?? prev
      );

      toast({
        title: "Success",
        description: `Updated shop status to ${updatedShop.status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Something wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ml-auto hidden h-8 lg:flex'
        >
          {loading ? (
            <CgSpinnerTwoAlt className='animate-spin h-5 w-5 text-primary' />
          ) : (
            <>
              <selected.icon />
              &nbsp;
              {selected.value}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[100px]'>
        <DropdownMenuLabel>Set status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statuses
          .filter((s) => s.value !== selected.value)
          .map((status) => {
            return (
              <DropdownMenuItem
                key={status.value}
                className='capitalize'
                onClick={() => setStatus(status.value)}
              >
                <status.icon />
                &nbsp;
                {status.value}
              </DropdownMenuItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

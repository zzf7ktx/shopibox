"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  OpenInNewWindowIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { useParams } from "next/navigation";
import { ShopStatus } from "@prisma/client";
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
import Link from "next/link";

type Option = {
  label: string;
  value: ShopStatus;
  icon: React.ComponentType<{ className?: string }>;
};

interface ShopStatusSwitcherProps {
  className?: string;
}

export default function ShopStatusSwitcher({
  className,
}: ShopStatusSwitcherProps) {
  const statuses = useMemo(
    () =>
      Object.entries(ShopStatus).map(([key, value]) => ({
        label: key,
        value: value,
        icon:
          value === ShopStatus.Active
            ? CheckCircledIcon
            : value === ShopStatus.Closed
            ? CrossCircledIcon
            : ReaderIcon,
      })),
    []
  );

  const [selected, setSelected] = useState<Option>(statuses[0]);
  const [shopDomain, setShopDomain] = useState<string>("#");
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();

  useEffect(() => {
    const init = async () => {
      if (!id) {
        return;
      }
      const shop = await getShop(id as string);
      if (shop.success && typeof shop.data !== "string") {
        const shopStatus = shop.data?.status;
        setSelected(
          (prev) => statuses.find((s) => s.value === shopStatus) ?? prev
        );
        setShopDomain(shop?.data?.shopDomain ?? "#");
      }

      setLoading(false);
    };

    init();
  }, [id, statuses]);

  const setStatus = async (status: ShopStatus) => {
    try {
      setLoading(true);
      const updatedShop = await updateShopGeneral(id as string, { status });

      if (updatedShop.success && typeof updatedShop.data !== "string") {
        const updatedShopStatus = updatedShop.data.status;
        setSelected(
          (prev) => statuses.find((s) => s.value === updatedShopStatus) ?? prev
        );

        toast({
          title: "Success",
          description: `Updated shop status to ${updatedShopStatus}.`,
        });
      } else {
        toast({
          title: "Error",
          description: String(updatedShop.data) ?? "Something wrong",
          variant: "destructive",
        });
      }
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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='default'
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
      <Link href={shopDomain} className='ms-2' target='_blank'>
        <Button size='sm' variant='outline'>
          <OpenInNewWindowIcon />
        </Button>
      </Link>
    </>
  );
}

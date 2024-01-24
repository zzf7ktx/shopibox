"use client";

import { useEffect, useState } from "react";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/Command";
import { DialogTrigger } from "@/components/ui/Dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import AddShopModal from "./AddShopModal";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getShops } from "@/actions/getShops";
import { Prisma, Shop } from "@prisma/client";

const groups = [
  {
    label: "Shopify",
    shops: [
      {
        label: "Shop 1",
        value: "shop-1",
      },
    ],
  },
];

type ShopOption = (typeof groups)[number]["shops"][number];

type Group = {
  label: string;
  shops: ShopOption[];
};

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

type ShopDto = Prisma.ShopGetPayload<{
  select: {
    id: true;
    name: true;
    syncStatus: true;
    provider: true;
    maskImages: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

interface ShopSwitcherProps extends PopoverTriggerProps {}

export default function ShopSwitcher({ className }: ShopSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState<ShopDto[]>([]);
  const [shopOptions, setShopOptions] = useState<Group[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopOption>(
    groups[0].shops[0]
  );

  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentSub = pathname.split("/").pop();
  useEffect(() => {
    const getShopOptions = async () => {
      const shops = await getShops();
      const currentShop = shops.find((shop) => shop.id === id);
      const groupByProvider = shops.reduce((result, item) => {
        const provider = item.provider;
        if (!result[provider]) {
          result[provider] = [];
        }
        result[provider].push(item);
        return result;
      }, {} as { [key: string]: any[] });

      setShopOptions(
        Object.entries(groupByProvider).map(([key, value]) => ({
          label: key,
          shops: value.map((s) => ({
            label: s.name,
            value: s.id,
          })),
        }))
      );

      setShops(shops);

      setSelectedShop({
        label: currentShop?.name ?? "",
        value: currentShop?.id ?? "",
      });
    };

    getShopOptions();
  }, []);

  return (
    <AddShopModal
      dialogTrigger={
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a shop"
              className={cn("w-[200px] justify-between", className)}
            >
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${selectedShop.value}.png`}
                  alt={selectedShop.label}
                  className="grayscale"
                />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              {selectedShop.label}
              <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandList>
                <CommandInput placeholder="Search shop..." />
                <CommandEmpty>No shop found.</CommandEmpty>
                {shopOptions.map((group) => (
                  <CommandGroup key={group.label} heading={group.label}>
                    {group.shops.map((shop) => (
                      <CommandItem
                        key={shop.value}
                        onSelect={() => {
                          setSelectedShop(shop);
                          setOpen(false);
                          router.replace(
                            `/main/shops/${shop.value}/${currentSub}`
                          );
                        }}
                        className="text-sm"
                      >
                        <Avatar className="mr-2 h-5 w-5">
                          <AvatarImage
                            src={`https://avatar.vercel.sh/${shop.value}.png`}
                            alt={shop.label}
                            className="grayscale"
                          />
                          <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        {shop.label}
                        <CheckIcon
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedShop.value === shop.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
              <CommandSeparator />
              <CommandList>
                <CommandGroup>
                  <DialogTrigger asChild>
                    <CommandItem>
                      <PlusCircledIcon className="mr-2 h-5 w-5" />
                      Create Shop
                    </CommandItem>
                  </DialogTrigger>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      }
    />
  );
}

"use client";

import { Table } from "@tanstack/react-table";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { DataTableFacetedFilter } from "@/components/ui/DataTableFacetedFilter";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addProductsToCollection,
  getCollections,
  addProductsToShop,
} from "@/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { useToast } from "@/components/ui/useToast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Badge } from "@/components/ui/Badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/Command";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { ToastAction } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import {
  CaretSortIcon,
  CheckIcon,
  Cross2Icon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { getShops } from "@/actions/getShops";
import Link from "next/link";

interface Option {
  value: string;
  label: string;
}

interface ProductTableToolbar<TData> {
  table: Table<TData>;
}

const collectionFormSchema = z.object({
  collections: z.array(z.string()).min(1).max(100),
});
const shopFormSchema = z.object({
  shop: z.string(),
});

function AddToCollectionDialog<TData>({
  collections,
  selectedProducts,
  table,
}: {
  collections: Option[];
  selectedProducts: string[];
  table: Table<TData>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [tempCollections, setTempCollections] = useState<Option[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof collectionFormSchema>>({
    resolver: zodResolver(collectionFormSchema),
    defaultValues: {
      collections: [],
    },
  });

  const onFinish = async (values: z.infer<typeof collectionFormSchema>) => {
    try {
      setLoading(true);
      const productsOnCollections = await addProductsToCollection({
        collectionIds: values.collections,
        productIds: selectedProducts,
      });

      toast({
        title: "Success",
        description: `${
          productsOnCollections.count / values.collections.length
        } products are added to ${values.collections.length} collections`,
      });

      form.reset();
      setOpen(false);
      router.refresh();
      table.toggleAllRowsSelected(false);
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

  const onOpenChange = (newValue: boolean) => {
    form.reset();
    setOpen(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-8 px-2 lg:px-3">
          Add to collection
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chose collections</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="collections"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Collections</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-auto justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                <div className="flex gap-1 w-full flex-wrap">
                                  {field.value
                                    .map((current) => {
                                      return (
                                        collections.find(
                                          (opt) => opt.value === current
                                        )?.label ?? current
                                      );
                                    })
                                    .map((selected, index) => (
                                      <Badge key={index} variant="secondary">
                                        {selected}
                                      </Badge>
                                    ))}
                                </div>
                              ) : (
                                "Select collections"
                              )}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="mw-[400px] p-0">
                          <Command>
                            <CommandInput
                              onValueChange={(e) =>
                                setTempCollections((prev) => {
                                  let newData = [...prev];
                                  newData[0] = {
                                    label: e,
                                    value: e,
                                  };
                                  return newData;
                                })
                              }
                              placeholder="Search collections..."
                              className="h-9"
                            />
                            <CommandEmpty>No collection found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="max-h-72">
                                {[...tempCollections, ...collections].map(
                                  (collection) => (
                                    <span key={collection?.value ?? ""}>
                                      {typeof collection !== "undefined" && (
                                        <CommandItem
                                          value={collection.label}
                                          onSelect={() => {
                                            const newValue =
                                              field.value.includes(
                                                collection.value
                                              )
                                                ? field.value.filter(
                                                    (cur) =>
                                                      cur !== collection.value
                                                  )
                                                : field.value.concat(
                                                    collection.value
                                                  );
                                            form.setValue(
                                              "collections",
                                              newValue
                                            );
                                          }}
                                        >
                                          {collection.label}
                                          <CheckIcon
                                            className={cn(
                                              "ml-auto h-4 w-4",
                                              field.value.includes(
                                                collection.value
                                              )
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      )}
                                    </span>
                                  )
                                )}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Choose existing collections or add to new collections.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  {loading && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
function AddToShopDialog<TData>({
  shops,
  selectedProducts,
  table,
}: {
  shops: Option[];
  selectedProducts: string[];
  table: Table<TData>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof shopFormSchema>>({
    resolver: zodResolver(shopFormSchema),
    defaultValues: {
      shop: "",
    },
  });

  const onFinish = async (values: z.infer<typeof shopFormSchema>) => {
    try {
      setLoading(true);
      const productsOnShop = await addProductsToShop({
        shopId: values.shop,
        productIds: selectedProducts,
      });

      toast({
        title: "Success",
        description: `${productsOnShop.count} products are added to shop`,
        action: (
          <ToastAction altText="ViewShopProduct" asChild>
            <Link href={`/main/shops/${values.shop}/products`}>Check out</Link>
          </ToastAction>
        ),
      });

      form.reset();
      setOpen(false);
      router.refresh();
      table.toggleAllRowsSelected(false);
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

  const onOpenChange = (newValue: boolean) => {
    form.reset();
    setOpen(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-8 px-2 lg:px-3">
          Add to shop
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose shop</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="shop"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Shop</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full h-auto justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                <div className="flex gap-1 w-full flex-wrap">
                                  {field.value}
                                </div>
                              ) : (
                                "Select shop"
                              )}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="mw-[400px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search shop..."
                              className="h-9"
                            />
                            <CommandEmpty>No shop found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="max-h-72">
                                {shops.map((shop, index) => (
                                  <CommandItem
                                    key={index}
                                    value={shop.label}
                                    onSelect={() => {
                                      form.setValue("shop", shop.value);
                                    }}
                                  >
                                    {shop.label}
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Shop for pushing those products
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">
                  {loading && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              </form>
            </Form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export function ProductTableToolbar<TData>({
  table,
}: ProductTableToolbar<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [loadingCollections, setLoadingCollection] = useState<boolean>(false);
  const [collections, setCollections] = useState<Option[]>([]);
  const [loadingShops, setLoadingShops] = useState<boolean>(false);
  const [shops, setShops] = useState<Option[]>([]);
  const selectedRows = table.getFilteredSelectedRowModel();

  useEffect(() => {
    const getCollectionOptions = async () => {
      setLoadingCollection(true);
      const collections = await getCollections();
      setCollections(
        collections.map((c) => ({
          label: c.name,
          value: c.id,
        }))
      );
      setLoadingCollection(false);
    };
    const getShopOptions = async () => {
      setLoadingShops(true);
      const shops = await getShops();
      setShops(
        shops.map((s) => ({
          label: s.name,
          value: s.id,
        }))
      );
      setLoadingShops(false);
    };
    getCollectionOptions();
    getShopOptions();
  }, []);

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter Name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("collections") && (
          <DataTableFacetedFilter
            column={table.getColumn("collections")}
            title="Collections"
            options={collections}
          />
        )}
        {table.getColumn("shops") && (
          <DataTableFacetedFilter
            column={table.getColumn("shops")}
            title="Shops"
            options={shops}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
        {selectedRows.rows.length > 0 && (
          <>
            <AddToCollectionDialog
              collections={collections}
              selectedProducts={selectedRows.rows.map(
                (r) => (r.original as any).id
              )}
              table={table}
            />
            <AddToShopDialog
              shops={shops}
              selectedProducts={selectedRows.rows.map(
                (r) => (r.original as any).id
              )}
              table={table}
            />
          </>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

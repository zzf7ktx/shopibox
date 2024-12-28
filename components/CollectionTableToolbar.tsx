"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/Input";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/Command";
import { ToastAction } from "@/components/ui/Toast";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { cn } from "@/lib/utils";
import {
  getShops,
  addCollectionProductsToShop,
  deleteCollections,
} from "@/actions/manage";
import { CaretSortIcon, ReloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";

interface Option {
  value: string;
  label: string;
}

const shopFormSchema = z.object({
  shop: z.string(),
});

function AddToShopDialog({
  shops,
  selectedCollections,
}: {
  shops: Option[];
  selectedCollections: string[];
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
      const productsOnShop = await addCollectionProductsToShop({
        shopId: values.shop,
        collectionIds: selectedCollections,
      });

      toast({
        title: "Success",
        description: `${productsOnShop.count} products are added to shop`,
        action: (
          <ToastAction altText='ViewShopProduct' asChild>
            <Link href={`/main/shops/${values.shop}/products`}>Check out</Link>
          </ToastAction>
        ),
      });

      form.reset();
      setOpen(false);
      router.refresh();
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
    if (loading) {
      return;
    }
    form.reset();
    setOpen(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant='default' className='h-8 px-2 lg:px-3'>
          Add to shop
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80%] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Choose shop</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className='space-y-8'
              >
                <FormField
                  control={form.control}
                  name='shop'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Shop</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              role='combobox'
                              className={cn(
                                "w-full h-auto justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                <div className='flex gap-1 w-full flex-wrap'>
                                  {field.value}
                                </div>
                              ) : (
                                "Select shop"
                              )}
                              <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='mw-[400px] p-0'>
                          <Command>
                            <CommandInput
                              placeholder='Search shop...'
                              className='h-9'
                            />
                            <CommandEmpty>No shop found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className='max-h-72'>
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
                <Button type='submit' disabled={loading}>
                  {loading && (
                    <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />
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

function DeleteCollectionDialog<TData>({
  selectedCollections,
  table,
}: {
  selectedCollections: string[];
  table: Table<TData>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const onFinish = async () => {
    try {
      setLoading(true);

      await deleteCollections(selectedCollections);

      toast({
        title: "Success",
        description: `${selectedCollections.length} ${
          selectedCollections.length > 1 ? "products" : "product"
        } are deleted`,
      });

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

  const onOpenChange = (open: boolean) => {
    if (loading) {
      return;
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant='destructive' className='h-8 px-2 lg:px-3'>
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80%] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Delete collection</DialogTitle>
          <DialogDescription>
            Do you want to delete permanently{" "}
            {selectedCollections.length > 1
              ? "these collections"
              : "this collection"}
            ?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='destructive' onClick={onFinish} disabled={loading}>
            {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
            Delete
          </Button>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CollectionTableToolbar<TData> {
  table: Table<TData>;
}

export function CollectionTableToolbar<TData>({
  table,
}: CollectionTableToolbar<TData>) {
  const [loadingShops, setLoadingShops] = useState<boolean>(false);
  const [shops, setShops] = useState<Option[]>([]);
  const selectedRows = table.getFilteredSelectedRowModel();

  useEffect(() => {
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
    getShopOptions();
  }, []);

  return (
    <div className='flex items-center justify-between mb-3'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Filter Name...'
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {selectedRows.rows.length > 0 && (
          <>
            <AddToShopDialog
              shops={shops}
              selectedCollections={selectedRows.rows.map(
                (r) => (r.original as any).id
              )}
            />
            <DeleteCollectionDialog
              selectedCollections={selectedRows.rows.map(
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

"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { addShop, getCollections } from "@/actions";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/useToast";
import { ToastAction } from "@/components/ui/Toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/Command";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { CaretSortIcon, CheckIcon, ReloadIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50),
  shopDomain: z
    .string()
    .min(2, {
      message: "Shop domain must be at least 2 characters.",
    })
    .max(50),
  apiKey: z
    .string()
    .min(2, {
      message: "Api key must be at least 2 characters.",
    })
    .max(50),
  collections: z.array(z.string()).min(0).max(1000),
});

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

export interface AddShopModalProps {
  dialogTrigger: ReactNode;
}

export type AddShopFormFields = z.infer<typeof formSchema>;

export default function AddShopModal({ dialogTrigger }: AddShopModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [collections, setCollections] = useState<Option[]>([]);
  const [loadingCollections, setLoadingCollection] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      collections: [],
    },
  });

  useEffect(() => {
    const getCollectionOptions = async () => {
      setLoadingCollection(true);
      const collections = await getCollections();
      setCollections(
        collections.map((collection) => ({
          value: collection.id,
          label: collection.name,
        }))
      );
      setLoadingCollection(false);
    };

    getCollectionOptions();
  }, []);

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const newShop = await addShop(values);

      toast({
        title: "Success",
        description: "Add shop successfully. Add some product to this shop",
        action: <ToastAction altText="AddProducts">Add products</ToastAction>,
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
    setOpen(newValue);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add shop</DialogTitle>
          <DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="name shop" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public shop name.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shopDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Domain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://2baf97-4.myshopify.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This is your public shop domain.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Api key</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} type="password" />
                      </FormControl>
                      <FormDescription>
                        The api key for this shop.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                              placeholder="Search collections..."
                              className="h-9"
                            />
                            <CommandEmpty>No collection found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="max-h-72">
                                {collections.map((collection) => (
                                  <CommandItem
                                    key={collection.value}
                                    value={collection.label}
                                    onSelect={() => {
                                      const newValue = field.value.includes(
                                        collection.value
                                      )
                                        ? field.value.filter(
                                            (cur) => cur !== collection.value
                                          )
                                        : field.value.concat(collection.value);
                                      form.setValue("collections", newValue);
                                    }}
                                  >
                                    {collection.label}
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        field.value?.includes(collection.value)
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Choose existing collections.
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

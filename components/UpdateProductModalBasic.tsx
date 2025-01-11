"use client";

import { Collection, Prisma } from "@prisma/client";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { updateProduct, getCollections, getProduct } from "@/actions/manage";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/useToast";
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
import { Textarea } from "@/components/ui/Textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { CaretSortIcon, CheckIcon, ReloadIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50),
  price: z.number().min(0, {
    message: "Price must be a positive value",
  }),
  description: z
    .string()
    .min(2, {
      message: "Description must be at least 2 characters.",
    })
    .max(250),
  descriptionHtml: z
    .string()
    .min(2, {
      message: "Description HTML must be at least 2 characters.",
    })
    .max(1000),
  category: z.optional(z.array(z.string())),
  collections: z.array(z.string()).min(1).max(100),
});

export enum UpdateProductDialogs {
  ProductInfo = "ProductInfo",
  ProductVariants = "ProductVariants",
}

export interface UpdateProductModalProps {
  dialogTrigger: ReactNode;
  productId: string;
  dialog?: UpdateProductDialogs;
}

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const renderItem = (collection: Collection): Option => ({
  value: collection.id,
  label: collection.name,
});

async function convertTxtToJSFlat(url: string): Promise<Array<Option>> {
  try {
    const res = await fetch(url);
    const dataStr = await res.text();
    const lines = dataStr.split("\n");

    const result: Option[] = [];

    for (const line of lines) {
      const fields = line.split("-");
      if (fields.length < 2) {
        continue;
      }

      result.push({
        label: fields[1].trim(),
        value: fields[1].trim(),
      });
    }
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default function UpdateProductModalBasic({
  productId,
  open,
  setOpen,
}: {
  productId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false);
  const [product, setProduct] = useState<
    Prisma.ProductGetPayload<{
      include: {
        collections: true;
      };
    }>
  >();
  const [categories, setCategories] = useState<Option[]>([]);
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [collections, setCollections] = useState<Option[]>([]);
  const [tempCollections, setTempCollections] = useState<Option[]>([]);
  const [loadingCollections, setLoadingCollection] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        name: product?.name ?? "",
        description: product?.description ?? "",
        descriptionHtml: product?.descriptionHtml ?? "",
        price: product?.price ?? 0,
        category:
          !product?.category || product.category === ""
            ? []
            : product?.category?.split(" > "),
        collections: product?.collections.map((c) => c.collectionId),
      }),
      [product]
    ),
  });

  useEffect(() => {
    form.reset();
  }, [open]);

  useEffect(() => {
    const getCollectionOptions = async () => {
      setLoadingCollection(true);
      const collections = await getCollections();

      if (collections.success && typeof collections.data !== "string") {
        setCollections(collections.data.map((p) => renderItem(p)));
      }
      setLoadingCollection(false);
    };
    getCollectionOptions();

    const getCategories = async () => {
      const result = await convertTxtToJSFlat(
        "https://res.cloudinary.com/dtp8svzny/raw/upload/v1706975157/settings/ba80fhq2bbit7jpgwz68.txt"
      );
      setCategories(result);
    };
    getCategories();
  }, []);

  useEffect(() => {
    const getProductInfo = async () => {
      setLoadingProduct(true);
      const product = await getProduct(productId);
      if (product.success && typeof product.data !== "string") {
        form.reset({
          name: product?.data?.name ?? "",
          description: product?.data?.description ?? "",
          descriptionHtml: product?.data?.descriptionHtml ?? "",
          price: product?.data?.price ?? 0,
          category:
            !product?.data?.category || product.data.category === ""
              ? []
              : product?.data?.category?.split(" > "),
          collections: product?.data?.collections.map((c) => c.collectionId),
        });
      }

      setLoadingProduct(false);
    };
    productId && open && getProductInfo();
  }, [productId, open]);

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const newProduct = await updateProduct(productId, values);

      toast({
        title: "Success",
        description: "Update product successfully.",
      });

      setOpen(false);
      router.refresh();
      form.reset();
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
    <DialogHeader>
      <DialogTitle>Update product</DialogTitle>
      <DialogDescription asChild>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className='space-y-8'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Product A' {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public product name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder='This is product A' {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the detail of product.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='descriptionHtml'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description HTML</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='<h4>This is product A</h4>'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is the detail of product in html.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Category</FormLabel>
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
                              {field.value.map((item) => (
                                <Badge key={item} variant='secondary'>
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            "Select category"
                          )}
                          <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='mw-[400px] p-0'>
                      <Command>
                        <CommandInput
                          onValueChange={(e) => setSearchCategory(e)}
                          placeholder='Search category...'
                          className='h-9'
                        />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className='max-h-72'>
                            {(searchCategory.length < 3
                              ? []
                              : categories.filter((c) =>
                                  c.value.includes(
                                    searchCategory.toLocaleLowerCase()
                                  )
                                )
                            ).map((category, index) => (
                              <CommandItem
                                key={index}
                                value={category.label}
                                onSelect={() => {
                                  form.setValue(
                                    "category",
                                    category.value.split(" > ")
                                  );
                                }}
                              >
                                {category.label}
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>This category is for SEO.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='collections'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Collections</FormLabel>
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
                              {field.value
                                .map((current) => {
                                  return (
                                    collections.find(
                                      (opt) => opt.value === current
                                    )?.label ?? current
                                  );
                                })
                                .map((selected, index) => (
                                  <Badge key={index} variant='secondary'>
                                    {selected}
                                  </Badge>
                                ))}
                            </div>
                          ) : (
                            "Select collections"
                          )}
                          <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='mw-[400px] p-0'>
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
                          placeholder='Search collections...'
                          className='h-9'
                        />
                        <CommandEmpty>No collection found.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className='max-h-72'>
                            {[...tempCollections, ...collections].map(
                              (collection) => (
                                <span key={collection?.value ?? ""}>
                                  {typeof collection !== "undefined" && (
                                    <CommandItem
                                      value={collection.label}
                                      onSelect={() => {
                                        const newValue = field.value.includes(
                                          collection.value
                                        )
                                          ? field.value.filter(
                                              (cur) => cur !== collection.value
                                            )
                                          : field.value.concat(
                                              collection.value
                                            );
                                        form.setValue("collections", newValue);
                                      }}
                                    >
                                      {collection.label}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          field?.value?.includes(
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
            <Button type='submit' disabled={loading}>
              {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
              Submit
            </Button>
          </form>
        </Form>
      </DialogDescription>
    </DialogHeader>
  );
}

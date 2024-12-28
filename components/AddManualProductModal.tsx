"use client";

import { Collection } from "@prisma/client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { addProduct, getCollections } from "@/actions/manage";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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
import UploadManualModal from "./UploadManualModal";

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

export interface AddManualProductModalProps {
  dialogTrigger: ReactNode;
}

export type AddProductFormFields = z.infer<typeof formSchema>;

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

const renderItem = (collection: Collection): Option => ({
  value: collection.id,
  label: collection.name,
});

async function convertTxtToJS(url: string): Promise<Array<Option>> {
  try {
    const res = await fetch(url);
    const dataStr = await res.text();
    const lines = dataStr.split("\n");
    const categoriesObject: any = {};

    for (const line of lines) {
      const fields = line.split("-");
      if (fields.length < 2) {
        continue;
      }

      let categories = fields[1].split(" > ");

      let subCatg = categoriesObject;
      for (let catg of categories) {
        subCatg[catg.trim()] = {} as any;
        subCatg = subCatg[catg.trim()];
      }
    }

    const result: Option[] = [];
    const stack = [{ categoriesObject, parent: result }];
    while (stack.length > 0) {
      const { categoriesObject, parent } = stack.pop()!;
      for (const [key, value] of Object.entries(categoriesObject)) {
        const newObj: Option = {
          label: key,
          value: key,
          children: [],
        };
        parent.push(newObj);
        stack.push({ categoriesObject: value, parent: newObj.children ?? [] });
      }
    }
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

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

export default function AddManualProductModal({
  dialogTrigger,
}: AddManualProductModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Option[]>([]);
  const [searchCategory, setSearchCategory] = useState<string>("");
  const [collections, setCollections] = useState<Option[]>([]);
  const [tempCollections, setTempCollections] = useState<Option[]>([]);
  const [loadingCollections, setLoadingCollection] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const uploadImageModalRef = useRef<HTMLButtonElement | null>(null);
  const [addedProductId, setAddedProductId] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      descriptionHtml: "",
      price: 0,
      collections: [],
    },
  });

  useEffect(() => {
    const getCollectionOptions = async () => {
      setLoadingCollection(true);
      const collections = await getCollections();
      setCollections(collections.map((p) => renderItem(p)));
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

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const newProduct = await addProduct(values);
      setAddedProductId(newProduct?.id ?? "");
      if (uploadImageModalRef?.current) {
        uploadImageModalRef.current.click();
      }

      toast({
        title: "Success",
        description:
          "Add product successfully. Upload some images for this product",
      });

      setOpen(false);
      form.reset();
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
    setOpen(newValue);
    form.reset();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogTrigger}
        <DialogContent className='max-h-[80%] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Add product manually</DialogTitle>
            <DialogDescription asChild>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onFinish)}
                  className='space-y-8'
                >
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
                          <Textarea
                            placeholder='This is product A'
                            {...field}
                          />
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
                        <FormDescription>
                          This category is for SEO.
                        </FormDescription>
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
      <UploadManualModal
        productKey={addedProductId}
        dialogTrigger={
          <DialogTrigger
            className='hidden'
            ref={uploadImageModalRef}
          ></DialogTrigger>
        }
      />
    </>
  );
}

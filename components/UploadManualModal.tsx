"use client";

import { Product } from "@prisma/client";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { getProducts, uploadImages } from "@/actions";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
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
import { CaretSortIcon, CheckIcon, ReloadIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";

const formSchema = z.object({
  productId: z.string(),
  files: z.any(),
});

export interface UploadManualModalProps {
  dialogTrigger: ReactNode;
  productKey?: string;
}

interface ProductOption {
  value: string;
  label: ReactNode;
}

const renderItem = (product: Product): ProductOption => ({
  value: product.id,
  label: product.name,
});

function getImageData(event: ChangeEvent<HTMLInputElement>) {
  const dataTransfer = new DataTransfer();
  const displayUrls: string[] = [];

  for (let image of Array.from(event.target.files!)) {
    dataTransfer.items.add(image);
    displayUrls.push(URL.createObjectURL(image));
  }

  const files = dataTransfer.files;

  return { files, displayUrls };
}

export interface UploadImagesFormFields {
  product: Product;
  files: FileList;
}

export default function UploadManualModal({
  dialogTrigger,
  productKey,
}: UploadManualModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
    },
  });

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      let data = new FormData();
      for (let i = 0; i < values.files.length; i++) {
        data.append("files", values.files[i]);
      }
      await uploadImages(values.productId, data);

      toast({
        title: "Success",
        description: "Upload images successfully.",
      });

      form.reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something error.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getProductOptions = async () => {
      setLoadingProducts(true);
      const products = await getProducts();
      setProductOptions(products.map((p) => renderItem(p)));
      setLoadingProducts(false);
    };
    getProductOptions();

    if (!!productKey) {
      form.setValue("productId", productKey);
    }
  }, [productKey]);

  const onOpenChange = (newValue: boolean) => {
    setOpen(newValue);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add images manually</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Product</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              disabled={!!productKey}
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
                                "Select product"
                              )}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="mw-[400px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search product..."
                              className="h-9"
                            />
                            <CommandEmpty>No product found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="max-h-72">
                                {productOptions.map((opt, index) => (
                                  <CommandItem
                                    key={index}
                                    value={opt.value}
                                    onSelect={(value) => {
                                      form.setValue("productId", value);
                                    }}
                                  >
                                    {opt.label}
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        field.value === opt.value
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
                        Choose product those images will belong to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="files"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Images</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          multiple
                          placeholder="shadcn"
                          {...rest}
                          onChange={(event) => {
                            const { files, displayUrls } = getImageData(event);
                            setImagePreview(displayUrls);
                            onChange(files);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="flex gap-1">
                        {imagePreview.map((img) => (
                          <Image
                            key={img}
                            width={40}
                            height={40}
                            src={img}
                            alt={img}
                          />
                        ))}
                        Choose images jpg, png, webp.
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

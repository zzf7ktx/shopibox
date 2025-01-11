"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { Csv } from "@/lib/csv";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { importProducts } from "@/actions/manage";
import { parseCurrency } from "@/utils";
import { useToast } from "@/components/ui/useToast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Checkbox } from "@/components/ui/Checkbox";
import { ReloadIcon } from "@radix-ui/react-icons";
import ProductTable from "./ProductTable";

const formSchema = z.object({
  autoSyncImages: z.boolean().optional(),
  file: z.any(),
});

type ProductWithCollections = Prisma.ProductGetPayload<{
  include: {
    images: true;
    collections: {
      include: {
        collection: true;
      };
    };
    shops: {
      include: {
        shop: true;
      };
    };
    variants: true;
  };
}>;

export interface ImportProductModalProps {
  dialogTrigger: ReactNode;
}

export default function ImportProductModal({
  dialogTrigger,
}: ImportProductModalProps) {
  const [imported, setImported] = useState<ProductWithCollections[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoSyncImages: false,
    },
  });

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      setLoadingFile(true);
      const file = e.target.files![0];

      await new Promise((resolve, reject) =>
        Csv.parse(file, {
          worker: true,
          header: true,
          complete: function (results: any) {
            const columnValues = results.data.map(
              (line: any, index: number) => {
                const variants = !line?.["variants"]
                  ? []
                  : JSON.parse(line?.["variants"]).reduce(
                      (acc: any[], cur: any) =>
                        acc.concat(
                          cur.values.map((cv: any) => ({
                            key: cur.name,
                            value: cv,
                          }))
                        ),
                      [] as { key: string; value: string }[]
                    );
                return {
                  id: String(index),
                  name: line?.["title"],
                  description: line?.["description_text"],
                  descriptionHtml: line?.["description_html"],
                  price: parseCurrency(line?.["price"] ?? ""),
                  category: line?.["category"],
                  variants,
                  collections: [
                    {
                      collection: {
                        name: line?.["collection"],
                      },
                    },
                  ],
                } as ProductWithCollections;
              }
            );
            setImported(columnValues);
            resolve(columnValues);
          },
        })
      );
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something error",
        variant: "destructive",
      });
    } finally {
      setLoadingFile(false);
    }
  };

  const onFinish = async ({
    file,
    autoSyncImages,
  }: z.infer<typeof formSchema>) => {
    try {
      if (!file || file.length < 1) {
        return;
      }

      const importFile = file[0];

      setLoading(true);

      const formData = new FormData();
      formData.append("file", importFile);
      const result = await importProducts(formData, autoSyncImages);
      const count = typeof result.data !== "string" ? result.data.length : 0;

      toast({
        title: "Success",
        description: `${count} products added.`,
      });

      form.reset();
      setImported([]);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something error",
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
    setImported([]);
    setOpen(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}
      <DialogContent className='w-full max-w-[80%] max-h-[80%] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Import products</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className='space-y-8'
              >
                <FormField
                  control={form.control}
                  name='file'
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input
                          type='file'
                          accept='.csv'
                          placeholder='abc.csv'
                          {...rest}
                          onChange={(event) => {
                            onFileChange(event);
                            onChange(event.target.files);
                          }}
                        />
                      </FormControl>
                      <FormDescription className='flex gap-1'>
                        Choose file csv.
                      </FormDescription>
                      <FormMessage />
                      <ProductTable data={imported} loading={loadingFile} />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='autoSyncImages'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel>Auto sync images</FormLabel>
                        <FormDescription>
                          The product images will be upload to cloud provider
                          automatically
                        </FormDescription>
                      </div>
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

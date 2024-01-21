"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/Dialog";
import { Prisma } from "@prisma/client";
import { Csv } from "@/lib/csv";
import ProductTable from "./ProductTable";
import { importProducts } from "@/actions";
import { parseCurrency } from "@/utils";
import { useToast } from "./ui/useToast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/Form";
import { useRouter } from "next/navigation";

type ProductWithCollections = Prisma.ProductGetPayload<{
  include: {
    collections: {
      include: {
        collection: true;
      };
    };
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
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<{ file: FileList }>({});

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];

    Csv.parse(file, {
      worker: true,
      header: true,
      complete: function (results: any) {
        const columnValues = results.data.map(
          (line: any, index: number) =>
            ({
              id: String(index),
              name: line?.["title"],
              description: line?.["description_text"],
              descriptionHtml: line?.["description_html"],
              price: parseCurrency(line?.["price"] ?? ""),
              category: line?.["category"],
              collections: [
                {
                  collection: {
                    name: line?.["collection"],
                  },
                },
              ],
            } as ProductWithCollections)
        );
        setImported(columnValues);
      },
    });
  };

  const onFinish = async ({ file }: { file: FileList }) => {
    try {
      if (!file || file.length < 1) {
        return;
      }

      const importFile = file[0];

      setLoading(true);

      const formData = new FormData();
      formData.append("file", importFile);

      const result = await importProducts(formData);
      toast({
        title: "Success",
        description: `${result?.length ?? 0} products added.`,
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
    form.reset();
    setImported([]);
    setOpen(newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}
      <DialogContent className="w-full max-w-[80%] max-h-[80%] overflow-auto">
        <DialogHeader>
          <DialogTitle>Import products</DialogTitle>
          <DialogDescription asChild>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".csv"
                          placeholder="abc.csv"
                          {...rest}
                          onChange={(event) => {
                            onFileChange(event);
                            onChange(event.target.files);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="flex gap-1">
                        Choose file csv.
                      </FormDescription>
                      <FormMessage />
                      <ProductTable data={imported} />
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

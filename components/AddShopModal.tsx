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
import { ReloadIcon } from "@radix-ui/react-icons";

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
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shopDomain: "",
      apiKey: "",
    },
  });

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
          <DialogDescription asChild>
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

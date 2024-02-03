"use client";

import { ChangeEvent, useMemo, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/Form";
import { useToast } from "@/components/ui/useToast";
import { ToastAction } from "@/components/ui/Toast";
import { Input } from "@/components/ui/Input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { addShop, updateShopGeneral } from "@/actions";
import { Prisma, Shop } from "@prisma/client";

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
  apiKey: z.optional(z.string()),
});

export interface ShopGeneralSettingsProps {
  shopInfo: Prisma.ShopGetPayload<{
    select: {
      id: true;
      name: true;
      shopDomain: true;
      syncStatus: true;
      provider: true;
      maskImages: true;
      createdAt: true;
      updatedAt: true;
    };
  }>;
}

export default function ShopGeneralSettings({
  shopInfo,
}: ShopGeneralSettingsProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        name: shopInfo.name,
        shopDomain: shopInfo.shopDomain,
        apiKey: "",
      }),
      [shopInfo]
    ),
  });

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const newShop = await updateShopGeneral(shopInfo.id, {
        apiKey: values.apiKey,
        name: values.name,
        shopDomain: values.shopDomain,
      });

      toast({
        title: "Success",
        description: "Update shop successfully",
      });

      form.reset({
        name: newShop.name,
        shopDomain: newShop.shopDomain,
      });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFinish)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="name shop" {...field} />
              </FormControl>
              <FormDescription>This is your public shop name.</FormDescription>
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
              <FormDescription>The api key for this shop.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          Update
        </Button>
      </form>
    </Form>
  );
}

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
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/useToast";
import { ToastAction } from "@/components/ui/Toast";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Prisma } from "@prisma/client";
import { updateShopLogo } from "@/actions/manage";
import Image from "next/image";

const formSchema = z.object({
  logoSrc: z.any(),
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

export interface ShopLogoSettingsProps {
  shopInfo: Prisma.ShopGetPayload<{
    select: {
      id: true;
      name: true;
      shopDomain: true;
      syncStatus: true;
      provider: true;
      images: true;
      createdAt: true;
      updatedAt: true;
    };
  }>;
}

export default function ShopLogoSettings({ shopInfo }: ShopLogoSettingsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>();

  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        logoSrc: shopInfo.images.find((i) => !i.productId)?.cloudLink,
      }),
      [shopInfo]
    ),
  });

  console.log(shopInfo);

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      let formData: FormData = new FormData();
      values.logoSrc?.[0] !== "" &&
        formData.append("file", values.logoSrc?.[0]);
      const mask = await updateShopLogo(
        shopInfo.id,
        {
          imageId: shopInfo.images?.[0]?.id ?? "",
        },
        formData
      );

      toast({
        title: "Success",
        description: "Update shop logo successfully",
      });

      form.reset({
        logoSrc: "",
      });
      router.refresh();
    } catch (error) {
      console.log(error);
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
      <form onSubmit={form.handleSubmit(onFinish)} className='space-y-8'>
        <div>
          <FormLabel>Logo in images {`(500x500)`}</FormLabel>
          <FormDescription>
            This image will be used as mask image over the images which pushed
            to this shop
          </FormDescription>

          <div className='flex md:flex-column gap-4'>
            <div className='flex flex-col gap-1'>
              <Card className='w-[500px] h-[500px] p-0'>
                <CardContent className='p-0'>
                  <div className='w-[500px] h-[500px] relative'>
                    <Card style={{ width: 500, height: 500 }} />
                    {(imagePreview || shopInfo.images?.[0]?.cloudLink) && (
                      <Image
                        className='absolute'
                        src={
                          imagePreview ?? shopInfo.images?.[0]?.cloudLink ?? ""
                        }
                        style={{ top: 0, right: 0, height: 500 }}
                        width={500}
                        height={500}
                        alt='image'
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className='flex md:flex-col gap-2'>
              <FormField
                control={form.control}
                name='logoSrc'
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Logo Src</FormLabel>
                    <FormControl>
                      <Input
                        type='file'
                        placeholder='abc.jpg'
                        {...rest}
                        onChange={(event) => {
                          const { files, displayUrls } = getImageData(event);
                          setImagePreview(displayUrls[0]);
                          onChange(files);
                        }}
                      />
                    </FormControl>
                    <FormDescription className='flex gap-1'>
                      Choose mask object image.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Button type='submit' disabled={loading}>
          {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
          Update
        </Button>
      </form>
    </Form>
  );
}

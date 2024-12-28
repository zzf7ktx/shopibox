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

const formSchema = z.object({
  maskObjectSrc: z.any(),
  maskObjectX: z.coerce.number().min(0).max(500),
  maskObjectY: z.coerce.number().min(0).max(700),
  maskObjectScale: z.coerce.number().min(0).max(100),
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
      maskImages: true;
      createdAt: true;
      updatedAt: true;
    };
  }>;
}

export default function ShopLogoSettings({ shopInfo }: ShopLogoSettingsProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>();
  const [backgroundImage, setBackgroundImage] = useState<string>(
    "https://picsum.photos/500"
  );

  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        maskObjectScale: shopInfo.maskImages?.[0]?.scale ?? 100,
        maskObjectX: shopInfo.maskImages?.[0]?.positionX ?? 0,
        maskObjectY: shopInfo.maskImages?.[0]?.positionY ?? 0,
        maskObjectSrc: "",
      }),
      [shopInfo]
    ),
  });

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      let formData: FormData = new FormData();
      values.maskObjectSrc?.[0] !== "" &&
        formData.append("file", values.maskObjectSrc?.[0]);
      const mask = await updateShopLogo(
        shopInfo.id,
        {
          maskObjectScale: values.maskObjectScale,
          maskObjectX: values.maskObjectX,
          maskObjectY: values.maskObjectY,
          maskImageId: shopInfo.maskImages?.[0]?.id ?? "",
        },
        formData
      );

      toast({
        title: "Success",
        description: "Add shop successfully. Add some product to this shop",
        action: <ToastAction altText='AddProducts'>Add products</ToastAction>,
      });

      form.reset({
        maskObjectScale: mask?.scale ?? 100,
        maskObjectX: mask?.positionX ?? 0,
        maskObjectY: mask?.positionY ?? 0,
        maskObjectSrc: "",
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
                    <img
                      src={backgroundImage}
                      alt='background'
                      width={500}
                      height={500}
                    />
                    {(imagePreview || shopInfo.maskImages?.[0]?.src) && (
                      <img
                        className='absolute'
                        src={
                          imagePreview ?? shopInfo.maskImages?.[0]?.src ?? ""
                        }
                        alt='image'
                        style={{
                          width: (form.watch().maskObjectScale * 500) / 100,
                          height: (form.watch().maskObjectScale * 500) / 100,
                          top:
                            form.watch().maskObjectY %
                            (form.watch().maskObjectScale === 100
                              ? 500
                              : 500 -
                                (form.watch().maskObjectScale * 500) / 100),
                          left:
                            form.watch().maskObjectX %
                            (form.watch().maskObjectScale === 100
                              ? 500
                              : 500 -
                                (form.watch().maskObjectScale * 500) / 100),
                        }}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              <Input
                className='mb-2'
                placeholder='Choose the image for preview'
                type='file'
                onChange={(event) => {
                  const { displayUrls } = getImageData(event);
                  setBackgroundImage(displayUrls[0]);
                }}
              />
            </div>
            <div className='flex md:flex-col gap-2'>
              <FormField
                control={form.control}
                name='maskObjectSrc'
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Logo - Src</FormLabel>
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
              <FormField
                control={form.control}
                name='maskObjectX'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo - X</FormLabel>
                    <FormControl>
                      <Input placeholder='X' {...field} type='number' />
                    </FormControl>
                    <FormDescription>Logo X position</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='maskObjectY'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo - Y</FormLabel>
                    <FormControl>
                      <Input placeholder='Y' {...field} type='number' />
                    </FormControl>
                    <FormDescription>Logo Y position</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='maskObjectScale'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo - Scale</FormLabel>
                    <FormControl>
                      <Input placeholder='Scale' {...field} type='number' />
                    </FormControl>
                    <FormDescription>Logo scale</FormDescription>
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

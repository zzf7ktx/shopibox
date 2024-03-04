"use client";

import { ChangeEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { addShop } from "@/actions";
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
import { Card, CardContent } from "./ui/Card";

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

export interface AddShopModalProps {
  dialogTrigger: ReactNode;
}

export default function AddShopModal({ dialogTrigger }: AddShopModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>();
  const [backgroundImage, setBackgroundImage] = useState<string>(
    "https://picsum.photos/500"
  );
  const [maskImageSize, setMaskImageSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 400,
    height: 400,
  });
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shopDomain: "",
      apiKey: "",
      maskObjectScale: 100,
      maskObjectX: 0,
      maskObjectY: 0,
      maskObjectSrc: "",
    },
  });

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      let formData: FormData = new FormData();
      formData.append("file", values.maskObjectSrc?.[0]);

      const newShop = await addShop(
        {
          apiKey: values.apiKey,
          name: values.name,
          shopDomain: values.shopDomain,
          maskObjectScale: values.maskObjectScale,
          maskObjectX: values.maskObjectX,
          maskObjectY: values.maskObjectY,
        },
        formData
      );

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
    if (loading) {
      return;
    }
    setOpen(newValue);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}
      <DialogContent className="w-full max-w-[80%] max-h-[80%] overflow-auto">
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
                <div>
                  <FormLabel>Logo in images {`(500x500)`}</FormLabel>
                  <FormDescription>
                    This image will be used as mask image over the images which
                    pushed to this shop
                  </FormDescription>

                  <div className="flex md:flex-column gap-4">
                    <div className="flex flex-col gap-1">
                      <Card className="w-[500px] h-[500px] p-0">
                        <CardContent className="p-0">
                          <div className="w-[500px] h-[500px] relative">
                            <img
                              src={backgroundImage}
                              alt="background"
                              width={500}
                              height={500}
                            />
                            {imagePreview && (
                              <img
                                className="absolute"
                                src={imagePreview ?? ""}
                                alt="image"
                                style={{
                                  width:
                                    (form.watch().maskObjectScale * 500) / 100,
                                  height:
                                    (form.watch().maskObjectScale * 500) / 100,
                                  top:
                                    form.watch().maskObjectY %
                                    (form.watch().maskObjectScale === 100
                                      ? 500
                                      : 500 -
                                        (form.watch().maskObjectScale * 500) /
                                          100),
                                  left:
                                    form.watch().maskObjectX %
                                    (form.watch().maskObjectScale === 100
                                      ? 500
                                      : 500 -
                                        (form.watch().maskObjectScale * 500) /
                                          100),
                                }}
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      <Input
                        className="mb-2"
                        placeholder="Choose the image for preview"
                        type="file"
                        onChange={(event) => {
                          const { displayUrls } = getImageData(event);
                          setBackgroundImage(displayUrls[0]);
                        }}
                      />
                    </div>
                    <div className="flex md:flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="maskObjectSrc"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormLabel>Logo - Src</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                placeholder="abc.jpg"
                                {...rest}
                                onChange={(event) => {
                                  const { files, displayUrls } =
                                    getImageData(event);
                                  setImagePreview(displayUrls[0]);
                                  onChange(files);
                                }}
                              />
                            </FormControl>
                            <FormDescription className="flex gap-1">
                              Choose mask object image.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maskObjectX"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo - X</FormLabel>
                            <FormControl>
                              <Input placeholder="X" {...field} type="number" />
                            </FormControl>
                            <FormDescription>Logo X position</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maskObjectY"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo - Y</FormLabel>
                            <FormControl>
                              <Input placeholder="Y" {...field} type="number" />
                            </FormControl>
                            <FormDescription>Logo Y position</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maskObjectScale"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo - Scale</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Scale"
                                {...field}
                                type="number"
                              />
                            </FormControl>
                            <FormDescription>Logo scale</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading}>
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

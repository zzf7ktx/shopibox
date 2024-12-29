"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { addShop } from "@/actions/manage";
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
import { CaretSortIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";
import { cn } from "@/lib/utils";
import { ShopProvider } from "@/types/shopProvider";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/Command";
import { ScrollArea } from "./ui/ScrollArea";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50),
  provider: z.string().min(1, "Provider must include."),
  shopDomain: z.optional(z.string()),
  apiKey: z.optional(z.string()),
  apiSerect: z.optional(z.string()),
  accessToken: z.optional(z.string()),
});

export interface AddShopModalProps {
  dialogTrigger: ReactNode;
}

export default function AddShopModal({ dialogTrigger }: AddShopModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      provider: "",
      shopDomain: "",
      apiKey: "",
      apiSerect: "",
      accessToken: "",
    },
  });

  const shopProviderOptions = Object.entries(ShopProvider).map(
    ([key, value]) => ({
      label: key,
      value: value,
      // icon:
      //   value === ShopStatus.Active
      //     ? CheckCircledIcon
      //     : value === ShopStatus.Closed
      //     ? CrossCircledIcon
      //     : ReaderIcon,
    })
  );

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      let formData: FormData = new FormData();

      const newShop = await addShop(
        {
          apiKey: values.apiKey ?? "",
          apiSerect: values.apiSerect ?? "",
          accessToken: values.accessToken ?? "",
          name: values.name,
          shopDomain: values.shopDomain ?? "",
          provider: values.provider as ShopProvider,
        },
        formData
      );

      toast({
        title: "Success",
        description: "Add shop successfully. Add some product to this shop",
        action: <ToastAction altText='AddProducts'>Add products</ToastAction>,
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
      <DialogContent className='w-full max-w-[80%] max-h-[80%] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Add shop</DialogTitle>
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
                        <Input placeholder='name shop' {...field} />
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
                  name='provider'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Provider</FormLabel>
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
                                  {field.value}
                                </div>
                              ) : (
                                "Select product"
                              )}
                              <CaretSortIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='mw-[400px] p-0'>
                          <Command>
                            <CommandInput
                              placeholder='Search providers...'
                              className='h-9'
                            />
                            <CommandEmpty>No providers found.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className='max-h-72'>
                                {shopProviderOptions.map((opt, index) => (
                                  <CommandItem
                                    key={index}
                                    value={opt.value}
                                    onSelect={(value) => {
                                      form.setValue("provider", value);
                                    }}
                                  >
                                    {opt.label}
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>Choose shop provider</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='shopDomain'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Domain</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='https://2baf97-4.myshopify.com'
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
                  name='apiKey'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Api key</FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} />
                      </FormControl>
                      <FormDescription>
                        The api key for this shop.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='apiSerect'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Api serect</FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} type='password' />
                      </FormControl>
                      <FormDescription>
                        The api serect for this shop.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='accessToken'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access token</FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} type='password' />
                      </FormControl>
                      <FormDescription>
                        The api key for this shop.
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
  );
}

"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { addCollection } from "@/actions/manage";
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
import Link from "next/link";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50),
  description: z.optional(
    z
      .string()
      .min(2, {
        message: "Description must be at least 2 characters.",
      })
      .max(250)
  ),
  publicName: z.optional(
    z
      .string()
      .min(2, {
        message: "Public name must be at least 2 characters.",
      })
      .max(50)
  ),
});

export interface AddManualCollectionModalProps {
  dialogTrigger: ReactNode;
}

export default function AddManualCollectionModal({
  dialogTrigger,
}: AddManualCollectionModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      publicName: "",
      description: "",
    },
  });

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      const newCollection = await addCollection(values);

      toast({
        title: "Success",
        description:
          "Add collection successfully. Add some product to this collection",
        action: (
          <ToastAction altText='AddProducts' asChild>
            <Link href='/products'>Add products</Link>
          </ToastAction>
        ),
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add collection manually</DialogTitle>
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
                        <Input placeholder='name' {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your collection name which unique.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='publicName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public name</FormLabel>
                      <FormControl>
                        <Input placeholder='public name' {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public collection name. Default will be set
                        as the name value.
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
                        <Input placeholder='something...' {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your collection description.
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

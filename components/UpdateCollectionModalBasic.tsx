"use client";

import { Collection } from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { updateCollection, getCollection } from "@/actions/manage";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/useToast";
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
import { Textarea } from "@/components/ui/Textarea";
import { ReloadIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50),
  description: z
    .string()
    .min(2, {
      message: "Description must be at least 2 characters.",
    })
    .max(250),
});

export enum UpdateCollectionDialogs {
  CollectionInfo = "CollectionInfo",
}

export default function UpdateCollectionModalBasic({
  collectionId,
  open,
  setOpen,
}: {
  collectionId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCollection, setLoadingCollection] = useState<boolean>(false);
  const [collection, setCollection] = useState<Collection>();

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        name: collection?.name ?? "",
        description: collection?.description ?? "",
      }),
      [collection]
    ),
  });

  useEffect(() => {
    form.reset();
  }, [open]);

  useEffect(() => {
    const getCollectionInfo = async () => {
      try {
        setLoadingCollection(true);
        const collection = await getCollection(collectionId);

        if (collection.success && typeof collection.data !== "string") {
          form.reset({
            name: collection?.data?.name ?? "",
            description: collection?.data?.description ?? "",
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingCollection(false);
      }
    };
    collectionId && open && getCollectionInfo();
  }, [collectionId, open]);

  const onFinish = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const updatedCollection = await updateCollection(collectionId, values);

      toast({
        title: "Success",
        description: "Update collection successfully.",
      });

      setOpen(false);
      router.refresh();
      form.reset();
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
    <DialogHeader>
      <DialogTitle>Update collection</DialogTitle>
      <DialogDescription asChild>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className='space-y-8'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Collection A' {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your collection name.
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
                    <Textarea placeholder='This is collection A' {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the detail of collection.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit' disabled={loading}>
              {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
              Submit
            </Button>
          </form>
        </Form>
      </DialogDescription>
    </DialogHeader>
  );
}

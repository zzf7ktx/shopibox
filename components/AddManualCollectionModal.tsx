"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCollection } from "@/actions";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { PlusCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { ToastAction } from "./ui/Toast";

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(50),
});

export interface AddManualCollectionModalProps {}

export interface AddCollectionFormFields {
  name: string;
}

export default function AddManualCollectionModal({}: AddManualCollectionModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
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
      <DialogTrigger asChild>
        <Button>
          <PlusCircledIcon className="mr-2 h-4 w-4" /> Upload
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add collection manually</DialogTitle>
          <DialogDescription>
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
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your public collection name.
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

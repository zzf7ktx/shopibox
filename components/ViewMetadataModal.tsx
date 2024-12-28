"use client";

import { ReactNode, useEffect, useState } from "react";
import metadata, { MetaTags, RawMetadata } from "@/lib/metadata";
import { updateMetadata } from "@/actions";
import { useRouter } from "next/navigation";
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
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/useToast";
import { ReloadIcon } from "@radix-ui/react-icons";

export interface ViewMetadataModalProps {
  dialogTrigger: ReactNode;
  imageSrc: string;
  imageId: string;
}

export default function ViewMetadataModal({
  dialogTrigger,
  imageSrc,
  imageId,
}: ViewMetadataModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string>("");
  const [meta, setMeta] = useState<RawMetadata>();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<Record<MetaTags, string>>();

  const onFinish = async (values: Record<MetaTags, string>) => {
    try {
      setLoading(true);

      let newMeta: RawMetadata = meta!;
      for (let code of Object.values(MetaTags)) {
        newMeta = metadata.setMetaByTag(newMeta, code, values[code]);
      }

      const newExifBinary = metadata.dump(newMeta!);
      const newPhotoData = metadata.insert(newExifBinary, imageData);
      let fileBuffer = Buffer.from(newPhotoData, "binary");
      const blob = new Blob([fileBuffer]);

      let data = new FormData();
      data.append("file", blob);

      await updateMetadata(imageId, data);
      setLoading(false);
      toast({
        title: "Success",
        description: "Update image metadata successfully",
      });
      router.refresh();
      setOpen(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something error",
      });
    }
  };

  useEffect(() => {
    const getMetadata = async () => {
      if (!imageSrc || !open) {
        return;
      }

      let base64: string = await metadata.getBase64Image(imageSrc);
      setImageData(base64);
      let originalMeta: RawMetadata = metadata.load(base64);
      setMeta(originalMeta);

      for (let code of Object.values(MetaTags)) {
        let fieldValue = metadata.getMetaByTag(originalMeta, code);
        if (!fieldValue) {
          continue;
        }

        if (typeof fieldValue === "string") {
          form.setValue(code, metadata.getMetaByTag(originalMeta, code));
        } else {
          form.setValue(
            code,
            metadata.decimalArrayToString(
              metadata.getMetaByTag(originalMeta, code)
            )
          );
        }
      }
    };
    getMetadata();
  }, [imageSrc, open]);

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
          <DialogDescription>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFinish)}
                className='space-y-8'
              >
                {Object.entries(MetaTags).map(([tag, code]) => (
                  <FormField
                    key={code}
                    name={code}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{tag}</FormLabel>
                        <FormControl>
                          <Input placeholder={tag} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

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

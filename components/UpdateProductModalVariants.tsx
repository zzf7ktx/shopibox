"use client";

import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { addOrUpdateProductVariants, getProductVariants } from "@/actions";
import { useRouter } from "next/navigation";
import {
  ControllerRenderProps,
  FieldValues,
  UseFormReturn,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { cn } from "@/lib/utils";
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
  FormControl,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Command,
  CommandInput,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  CaretSortIcon,
  CheckIcon,
  Cross2Icon,
  PlusIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Card, CardContent, CardHeader } from "./ui/Card";

export enum UpdateProductDialogs {
  ProductInfo = "ProductInfo",
  ProductVariants = "ProductVariants",
}

export interface UpdateProductModalProps {
  dialogTrigger: ReactNode;
  productId: string;
  dialog?: UpdateProductDialogs;
}

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

function ProductVariantValueCombobox({
  field,
  form,
}: {
  field: ControllerRenderProps<FieldValues, `variants.${number}.values`>;
  form: UseFormReturn<FieldValues, any, undefined>;
}) {
  const [values, setValues] = useState<Option[]>([]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full h-auto justify-between",
              !field.value && "text-muted-foreground"
            )}
          >
            {field.value ? (
              <div className="flex gap-1 w-full flex-wrap">
                {field.value.map((selected: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    <Cross2Icon
                      onClick={() => {
                        const newValue = field.value.filter(
                          (cur: string) => cur !== selected
                        );
                        form.setValue(field.name, newValue);
                      }}
                    />
                    {selected}
                  </Badge>
                ))}
              </div>
            ) : (
              "Create values"
            )}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="mw-[400px] p-0">
        <Command>
          <CommandInput
            onValueChange={(e) =>
              setValues((prev) => {
                let newData = [...prev];
                newData[0] = {
                  label: e,
                  value: e,
                };
                return newData;
              })
            }
            placeholder="Create values"
            className="h-9"
          />
          <CommandGroup>
            <ScrollArea className="max-h-72">
              {values.map((value) => (
                <span key={value?.value ?? ""}>
                  {typeof value !== "undefined" && (
                    <CommandItem
                      value={value.label}
                      onSelect={() => {
                        const newValue = field.value.includes(value.value)
                          ? field.value.filter(
                              (cur: string) => cur !== value.value
                            )
                          : field.value.concat(value.value);
                        form.setValue(field.name, newValue);
                      }}
                    >
                      {value.label}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          field?.value?.includes(value.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  )}
                </span>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function UpdateProductModalVariants({
  productId,
  open,
  setOpen,
}: {
  productId: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const form = useForm();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const handleAddNew = () =>
    append({
      name: "",
      values: [],
    });
  const handleRemove = (index: number) => remove(index);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProductVariants, setLoadingProductVariants] =
    useState<boolean>(false);
  const [productVariantsData, setProductVariantsData] = useState<
    { name: string; values: string[] }[]
  >([]);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    form.reset();
  }, [open]);

  useEffect(() => {}, []);

  useEffect(() => {
    const getVariants = async () => {
      setLoadingProductVariants(true);
      let variants = await getProductVariants(productId);
      let output: { [key: string]: string[] } = {};
      for (let variant of variants) {
        let name = variant.key;
        let value = variant.value;

        if (!output[name]) {
          output[name] = [];
        }

        output[name].push(value);
      }

      form.reset();

      for (let [key, values] of Object.entries(output)) {
        append({
          name: key,
          values: values,
        });
      }

      setLoadingProductVariants(false);
    };
    productId && open && getVariants();
  }, [productId, open]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const variants = await addOrUpdateProductVariants(productId, values);

      toast({
        title: "Success",
        description: "Update product variants successfully.",
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
      <DialogTitle>Update product variants</DialogTitle>
      <DialogDescription asChild>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className="space-y-8">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardHeader>
                  <Button
                    size="icon"
                    className="ms-auto"
                    onClick={() => handleRemove(index)}
                    variant="outline"
                  >
                    <Cross2Icon />
                  </Button>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`variants.${index}.values`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <ProductVariantValueCombobox
                          field={field}
                          form={form}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
            <Button type="button" onClick={() => handleAddNew()} variant="link">
              <PlusIcon /> Add new option
            </Button>
            <br />
            <Button type="submit">
              {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </form>
        </Form>
      </DialogDescription>
    </DialogHeader>
  );
}

"use client";

import { ReactNode, useEffect, useState } from "react";
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
import { WorkflowComponent } from "@prisma/client";
import { parseParameters } from "@/lib/workflow/utils/parseParameters";
import { Input as InputValue } from "@/lib/workflow/types/input";
import { ParameterType } from "@/lib/workflow/types/parameter";
import { addWorkflowStep } from "@/actions/manage";

export interface AddWorkflowStepModalProps {
  dialogTrigger: ReactNode;
  workflowId: string;
  component: WorkflowComponent;
  defaultValues?: InputValue[];
}

export default function AddWorkflowStepModal({
  dialogTrigger,
  workflowId,
  component,
  defaultValues,
}: AddWorkflowStepModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<Record<string, string>>();

  const onFinish = async (values: Record<string, string>) => {
    try {
      setLoading(true);
      const data = Object.entries(values).map(([key, value]) => ({
        key,
        value,
      }));

      await addWorkflowStep(workflowId, {
        componentCode: component.code,
        order: +values["order"],
        inputValues: data.filter((d) => d.key !== "order"),
      });

      setLoading(false);
      toast({
        title: "Success",
        description: "Add step successfully",
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

  const onOpenChange = (newValue: boolean) => {
    if (loading) {
      return;
    }
    setOpen(newValue);
    form.reset();
  };

  const parameters = parseParameters(component?.parameters ?? "[]");

  useEffect(() => {
    if (!!defaultValues) {
      const values = defaultValues.reduce(
        (acc, cur) => ({ ...acc, [cur.key]: cur.value }),
        {} as { [key: string]: string }
      );

      form.reset(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add workflow step</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)} className='space-y-8'>
            <FormField
              name='order'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input placeholder='order' type='number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {parameters.map((p) => (
              <FormField
                key={p.name}
                name={p.name}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{p.name}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={p.name}
                        disabled={p.isConstant}
                        type={
                          p.type == ParameterType.Number ? "number" : "string"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button type='submit' disabled={loading}>
              {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

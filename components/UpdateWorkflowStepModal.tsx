"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
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
import { Prisma } from "@prisma/client";
import { parseParameters } from "@/lib/workflow/utils/parseParameters";
import { updateWorkflowStep } from "@/actions/manage";
import { ParameterType } from "@/lib/workflow/types/parameter";
import { parseInputs } from "@/lib/workflow/utils/parseInputs";

export interface UpdateWorkflowStepModalProps {
  dialogTrigger: ReactNode;
  workflowStepInfo: Prisma.WorkflowStepGetPayload<{
    select: {
      id: true;
      order: true;
      component: true;
      inputValues: true;
    };
  }>;
}

export default function UpdateWorkflowStepModal({
  dialogTrigger,
  workflowStepInfo,
}: UpdateWorkflowStepModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<Record<string, string>>();

  const onFinish = async (values: Record<string, string | number>) => {
    try {
      setLoading(true);
      const data = Object.entries(values).map(([key, value]) => ({
        key,
        value,
      }));

      await updateWorkflowStep(workflowStepInfo.id, {
        order: +values["order"],
        inputValues: data.filter((d) => d.key !== "order"),
      });

      setLoading(false);
      toast({
        title: "Success",
        description: "Update step successfully",
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

  const parameters = useMemo(
    () => parseParameters(workflowStepInfo.component?.parameters ?? "[]"),
    [workflowStepInfo]
  );

  useEffect(() => {
    if (!!workflowStepInfo) {
      const inputs = parseInputs(workflowStepInfo.inputValues ?? "[]");
      const values = inputs.reduce(
        (acc, cur) => ({ ...acc, [cur.key]: cur.value }),
        {} as { [key: string]: string }
      );

      values["order"] = `${workflowStepInfo.order}`;

      form.reset(values);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowStepInfo, parameters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogTrigger}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update workflow step</DialogTitle>
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

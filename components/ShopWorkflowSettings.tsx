"use client";

import { Fragment, useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  ArrowRightIcon,
  CaretSortIcon,
  CheckIcon,
  Cross2Icon,
  Pencil2Icon,
  PlusCircledIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Prisma, WorkflowComponent } from "@prisma/client";
import { deleteWorkflowSteps, getWorkflowComponents } from "@/actions/manage";
import { parseParameters } from "@/lib/workflow/utils/parseParameters";
import { parseInputs } from "@/lib/workflow/utils/parseInputs";
import { Label } from "./ui/Label";
import UpdateWorkflowStepModal from "./UpdateWorkflowStepModal";
import {
  DialogDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/Dialog";
import AddWorkflowStepModal from "./AddWorkflowStepModal";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/Command";
import { useToast } from "./ui/useToast";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/Badge";
import { Separator } from "./ui/Separator";
import { WorkflowComponentType } from "@/lib/workflow/types/workflowComponentType";

interface Option {
  value: WorkflowComponent;
  label: string;
}

const DeleteDialog = ({ selected }: { selected: string[] }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const onFinish = async () => {
    try {
      setLoading(true);

      await deleteWorkflowSteps(selected);

      toast({
        title: "Success",
        description: `The step is deleted`,
      });

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

  const onOpenChange = (open: boolean) => {
    if (loading) {
      return;
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant='outline' size='icon'>
          <Cross2Icon className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='max-h-[80%] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Delete step</DialogTitle>
          <DialogDescription>
            Do you want to delete permanently this step
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='destructive' onClick={onFinish} disabled={loading}>
            {loading && <ReloadIcon className='mr-2 h-4 w-4 animate-spin' />}
            Delete
          </Button>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export interface ShopWorkflowSettingsProps {
  shopInfo: Prisma.ShopGetPayload<{
    select: {
      id: true;
      name: true;
      shopDomain: true;
      syncStatus: true;
      provider: true;
      workflow: {
        select: {
          id: true;
          steps: {
            select: {
              id: true;
              component: true;
              componentCode: true;
              order: true;
              inputValues: true;
            };
          };
        };
      };
      images: true;
      createdAt: true;
      updatedAt: true;
    };
  }>;
}

export default function ShopWorkflowSettings({
  shopInfo,
}: ShopWorkflowSettingsProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [componentOptions, setComponentOptions] = useState<Option[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Option>(
    {} as Option
  );

  useEffect(() => {
    const getComponentOptions = async () => {
      const countComponents = (shopInfo.workflow?.steps ?? [])
        .map((s) => s.componentCode)
        .reduce((acc, item) => {
          acc[item] = (acc[item] || 0) + 1;
          return acc;
        }, {} as { [key: string]: number });

      const components = (await getWorkflowComponents()).filter(
        (c) => !c.limit || (countComponents[c.code] ?? 0) < c.limit
      );

      setComponentOptions(
        components.map((c) => ({
          label: c.name,
          value: c,
        }))
      );

      setSelectedComponent({
        label: components[0]?.name ?? "",
        value: components[0],
      });
    };

    getComponentOptions();
  }, []);

  return (
    <div>
      <div className='flex gap-2 mb-3'>
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              role='combobox'
              aria-expanded={open}
              aria-label='Select a shop'
              className={cn(
                "w-[350px] justify-between text-clip overflow-clip"
              )}
            >
              <span>{selectedComponent.label}</span>
              <CaretSortIcon className='ml-auto h-4 w-4 shrink-0 opacity-50' />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-[200px] p-0'>
            <Command>
              <CommandList>
                <CommandInput placeholder='Search shop...' />
                <CommandEmpty>No shop found.</CommandEmpty>
                {componentOptions.map((opt, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      setSelectedComponent(opt);
                      setOpen(false);
                    }}
                    className='text-sm'
                  >
                    {opt.label}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedComponent.value === opt.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <AddWorkflowStepModal
          dialogTrigger={
            <DialogTrigger asChild>
              <Button variant='outline' size='icon'>
                <PlusCircledIcon className='h-4 w-4' />
              </Button>
            </DialogTrigger>
          }
          workflowId={shopInfo?.workflow?.id ?? ""}
          component={selectedComponent.value}
          defaultValues={[{ key: "shop", value: shopInfo.id }]}
        />
      </div>
      <div className='flex items-center overflow-x-auto flex-wrap gap-y-4'>
        {(shopInfo?.workflow?.steps ?? []).map((s, index) => (
          <Fragment key={s.id}>
            <Card className='w-60 overflow-hidden'>
              <CardHeader className='p-4'>
                <div className='flex justify-between'>
                  <Badge variant='outline'>{s.component.type}</Badge>
                  <div>
                    <UpdateWorkflowStepModal
                      dialogTrigger={
                        <DialogTrigger asChild>
                          <Button
                            variant='outline'
                            size='icon'
                            className='mr-2'
                          >
                            <Pencil2Icon className='h-4 w-4' />
                          </Button>
                        </DialogTrigger>
                      }
                      workflowStepInfo={s}
                    />
                    <DeleteDialog selected={[s.id]} />
                  </div>
                </div>
                <Separator />
                <CardTitle className='flex justify-between items-start'>
                  <span className='basis-4/5'>{s.component.name}</span>
                </CardTitle>
                <CardDescription className='text-xs'>
                  {s.component.code}
                </CardDescription>
              </CardHeader>
              <CardContent className='p-4'>
                {parseParameters(s.component.parameters).map((p, pIndex) => (
                  <div key={pIndex}>
                    <Label>{p.name}</Label>
                    <Input
                      placeholder={p.name}
                      readOnly={p.isConstant}
                      defaultValue={parseInputs(s.inputValues)[pIndex].value}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
            {index !== (shopInfo?.workflow?.steps ?? []).length - 1 && (
              <ArrowRightIcon className='h-8 w-8' />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

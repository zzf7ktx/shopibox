"use client";

import {
  CheckCircledIcon,
  Cross2Icon,
  CrossCircledIcon,
  HandIcon,
  ReloadIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { ImageSource, ImageSyncStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { DataTableFacetedFilter } from "@/components/ui/DataTableFacetedFilter";
import { useState } from "react";
import { useToast } from "./ui/useToast";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/Dialog";
import { deleteImages, syncManyImagesWithMainProvider } from "@/actions";

function DeleteImageDialog<TData>({
  selectedImages,
  table,
}: {
  selectedImages: string[];
  table: Table<TData>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const onFinish = async () => {
    try {
      setLoading(true);

      await deleteImages(selectedImages);

      toast({
        title: "Success",
        description: `${selectedImages.length} ${
          selectedImages.length > 1 ? "images" : "image"
        } are deleted`,
      });

      setOpen(false);
      router.refresh();
      table.toggleAllRowsSelected(false);
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
        <Button variant="destructive" className="h-8 px-2 lg:px-3">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Delete image</DialogTitle>
          <DialogDescription>
            Do you want to delete permanently{" "}
            {selectedImages.length > 1 ? "these images" : "this image"}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={onFinish} disabled={loading}>
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SyncImageDialog<TData>({
  selectedImages,
  table,
}: {
  selectedImages: string[];
  table: Table<TData>;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const onFinish = async () => {
    try {
      setLoading(true);

      await syncManyImagesWithMainProvider(selectedImages, "default");

      toast({
        title: "Success",
        description: `${selectedImages.length} ${
          selectedImages.length > 1 ? "images" : "image"
        } are synced`,
      });

      setOpen(false);
      router.refresh();
      table.toggleAllRowsSelected(false);
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
        <Button variant="default" className="h-8 px-2 lg:px-3">
          Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sync images</DialogTitle>
          <DialogDescription>
            Do you want to sync{" "}
            {selectedImages.length > 1 ? "these images" : "this image"} to
            cloud?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="default" onClick={onFinish} disabled={loading}>
            {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Sync
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ImageTableToolbar<TData> {
  table: Table<TData>;
}

export function ImageTableToolbar<TData>({ table }: ImageTableToolbar<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel();
  const isFiltered = table.getState().columnFilters.length > 0;
  const sources = Object.entries(ImageSource).map(([key, value]) => ({
    label: key,
    value: value,
    icon: value === ImageSource.Auto ? RocketIcon : HandIcon,
  }));
  const statuses = Object.entries(ImageSyncStatus).map(([key, value]) => ({
    label: key,
    value: value,
    icon:
      value === ImageSyncStatus.Synced ? CheckCircledIcon : CrossCircledIcon,
  }));

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter Name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("source") && (
          <DataTableFacetedFilter
            column={table.getColumn("source")}
            title="Source"
            options={sources}
          />
        )}
        {table.getColumn("syncStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("syncStatus")}
            title="Cloud status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
        {selectedRows.rows.length > 0 && (
          <>
            <SyncImageDialog
              selectedImages={selectedRows.rows.map(
                (r) => (r.original as any).id
              )}
              table={table}
            />
            <DeleteImageDialog
              selectedImages={selectedRows.rows.map(
                (r) => (r.original as any).id
              )}
              table={table}
            />
          </>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

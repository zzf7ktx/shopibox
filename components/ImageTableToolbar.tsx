"use client";

import {
  CheckCircledIcon,
  Cross2Icon,
  CrossCircledIcon,
  HandIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";
import { ImageSource, ImageSyncStatus } from "@prisma/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { DataTableFacetedFilter } from "@/components/ui/DataTableFacetedFilter";

interface ImageTableToolbar<TData> {
  table: Table<TData>;
}

export function ImageTableToolbar<TData>({ table }: ImageTableToolbar<TData>) {
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
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

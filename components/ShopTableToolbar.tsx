"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/Input";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { ShopStatus, ShopSyncStatus } from "@prisma/client";
import {
  CheckCircledIcon,
  Cross2Icon,
  CrossCircledIcon,
  ReaderIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { DataTableFacetedFilter } from "@/components/ui/DataTableFacetedFilter";
import { Button } from "@/components/ui/Button";

interface ShopTableToolbar<TData> {
  table: Table<TData>;
}

export function ShopTableToolbar<TData>({ table }: ShopTableToolbar<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const pushStatuses = Object.entries(ShopSyncStatus).map(([key, value]) => ({
    label: key,
    value: value,
    icon:
      value === ShopSyncStatus.PushedAll
        ? CheckCircledIcon
        : value === ShopSyncStatus.NotPublished
        ? CrossCircledIcon
        : StopwatchIcon,
  }));

  const statuses = Object.entries(ShopStatus).map(([key, value]) => ({
    label: key,
    value: value,
    icon:
      value === ShopStatus.Active
        ? CheckCircledIcon
        : value === ShopStatus.Closed
        ? CrossCircledIcon
        : ReaderIcon,
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
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("syncStatus") && (
          <DataTableFacetedFilter
            column={table.getColumn("syncStatus")}
            title="Publish status"
            options={pushStatuses}
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

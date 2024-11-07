"use client";

import { Table } from "@tanstack/react-table";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { JobStatus } from "@prisma/client";
import {
  CheckCircledIcon,
  Cross2Icon,
  CrossCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { DataTableFacetedFilter } from "@/components/ui/DataTableFacetedFilter";
import { Button } from "@/components/ui/Button";

interface JobTableToolbar<TData> {
  table: Table<TData>;
}

export function JobTableToolbar<TData>({ table }: JobTableToolbar<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const statuses = Object.entries(JobStatus).map(([key, value]) => ({
    label: key,
    value: value,
    icon:
      value === JobStatus.Succeeded
        ? CheckCircledIcon
        : value === JobStatus.Failed
        ? CrossCircledIcon
        : StopwatchIcon,
  }));
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex flex-1 items-center space-x-2">
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
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

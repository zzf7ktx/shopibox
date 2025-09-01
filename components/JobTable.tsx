"use client";
import { JobStatus, Prisma } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { JobTableToolbar } from "./JobTableToolbar";

type JobWithShop = Prisma.JobGetPayload<{
  include: {
    shop: true;
  };
}> & { totalProducts?: number };

const columns: ColumnDef<JobWithShop>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
  },
  {
    accessorKey: "uploadedProducts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Uploaded" />
    ),
  },
  {
    accessorKey: "totalProducts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch" />
    ),
  },
  {
    accessorKey: "batch",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Batch" />
    ),
  },
  {
    accessorKey: "shop",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shop Name" />
    ),
    cell: ({ row }) => {
      const shop = row.original;
      return shop.shop?.name;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = Object.keys(JobStatus).find(
        (status) => status === row.getValue("status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[150px] items-center">
          {status === JobStatus.Succeeded ? (
            <CheckCircledIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : status === JobStatus.Failed ? (
            <CrossCircledIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : (
            <StopwatchIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const shop = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(shop.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export interface JobTableProps {
  data?: Array<JobWithShop>;
  loading?: boolean;
}

export default function JobTable({ data = [], loading }: JobTableProps) {
  const transformed = data.map((job) => ({
    ...job,
    totalProducts: job.productIds?.length ?? 0,
  }));
  return (
    <DataTable
      loading={loading}
      columns={columns}
      data={transformed}
      toolbar={(table) => <JobTableToolbar table={table} />}
    />
  );
}

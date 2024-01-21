"use client";
import { Prisma, ShopSyncStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";
import { ShopTableToolbar } from "./ShopTableToolbar";

type ShopDto = Prisma.ShopGetPayload<{
  select: {
    id: true;
    name: true;
    syncStatus: true;
    maskImages: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

const columns: ColumnDef<ShopDto>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "syncStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Publish status" />
    ),
    cell: ({ row }) => {
      const status = Object.keys(ShopSyncStatus).find(
        (status) => status === row.getValue("syncStatus")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="flex w-[150px] items-center">
          {status === ShopSyncStatus.PushedAll ? (
            <CheckCircledIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          ) : status === ShopSyncStatus.NotPublished ? (
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
            <DropdownMenuItem>View products</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export interface ShopTableProps {
  data?: Array<ShopDto>;
  loading?: boolean;
}

export default function ShopTable({ data = [], loading }: ShopTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => <ShopTableToolbar table={table} />}
    />
  );
}

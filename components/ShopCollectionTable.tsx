"use client";

import { Prisma } from "@prisma/client";
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
  MinusCircledIcon,
} from "@radix-ui/react-icons";
import { CollectionTableToolbar } from "./CollectionTableToolbar";

type CollectionOnShop = Prisma.CollectionGetPayload<{
  include: {
    products: {
      select: {
        productId: true;
      };
    };
    shops: {
      include: {
        shop: true;
      };
    };
  };
}>;

const columns: ColumnDef<CollectionOnShop>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "shops",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const collection = row.original;
      const noPushed = collection.shops[0].noPushedProducts;
      const productCount = collection.products.length;
      return (
        <div className="flex w-[150px] items-center">
          {noPushed === productCount ? (
            <CheckCircledIcon className="mr-2 h-4 w-4 text-green-700" />
          ) : noPushed === 0 ? (
            <CrossCircledIcon className="mr-2 h-4 w-4 text-red-700" />
          ) : (
            <MinusCircledIcon className="mr-2 h-4 w-4 text-yellow-700" />
          )}
          <span>
            {noPushed === productCount
              ? `Pushed all`
              : noPushed === 0
              ? "Not pushed"
              : `Partial(${noPushed}/${productCount})`}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const collection = row.original;
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
              onClick={() => navigator.clipboard.writeText(collection.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Push all</DropdownMenuItem>
            <DropdownMenuItem>Fork and edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export interface ShopCollectionTableProps {
  data?: Array<CollectionOnShop>;
  loading?: boolean;
}

export default function ShopCollectionTable({
  data = [],
  loading,
}: ShopCollectionTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => <CollectionTableToolbar table={table} />}
    />
  );
}

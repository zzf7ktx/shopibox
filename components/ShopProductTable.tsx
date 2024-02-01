"use client";

import { Prisma } from "@prisma/client";
import { ColumnDef, Row } from "@tanstack/react-table";
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
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import {
  CheckCircledIcon,
  ClockIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { ShopProductTableToolbar } from "./ShopProductTableToolbar";
import { getRowRange } from "@/utils";

type ProductOnShop = Prisma.ProductGetPayload<{
  include: {
    images: true;
    collections: {
      include: {
        collection: true;
      };
    };
    shops: true;
  };
}>;

let lastSelectedId = "";

const columns: ColumnDef<ProductOnShop>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row, table }) => {
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onClick={(e) => {
            if (e.shiftKey) {
              const { rows, rowsById } = table.getRowModel();
              const rowsToToggle = getRowRange(rows, row.id, lastSelectedId);
              const isLastSelected = rowsById[lastSelectedId].getIsSelected();
              rowsToToggle.forEach((row) => row.toggleSelected(isLastSelected));
            }

            lastSelectedId = row.id;
          }}
          onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "collections",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Collections" />;
    },
    cell: ({ row }) => {
      const collections = row.original.collections;
      return (
        <div className="flex gap-1">
          {collections?.map((item, index) => (
            <Badge key={index} variant="secondary" className="mb-1 last:mb-0">
              {item.collection.name}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, _columnId, value) => {
      return row.original.collections.some((c) =>
        value.includes(c.collectionId)
      );
    },
  },
  {
    accessorKey: "shops",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const productStatus = row.original.shops[0].status;
      return (
        <div className="flex w-[150px] items-center">
          {productStatus === "Published" ? (
            <CheckCircledIcon className="mr-2 h-4 w-4 text-green-700" />
          ) : productStatus === "NotPublished" ? (
            <CrossCircledIcon className="mr-2 h-4 w-4 text-red-700" />
          ) : (
            <ClockIcon className="mr-2 h-4 w-4 text-yellow-700" />
          )}
          <span>{productStatus}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <ActionCell row={row.original} />;
    },
  },
];

function ActionCell({ row }: { row: ProductOnShop }) {
  const router = useRouter();
  const pushToShop = async () => {
    router.refresh();
  };
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
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.id)}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={row.shops[0].status !== "NotPublished"}
          onClick={pushToShop}
        >
          Push
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface ShopProductTableProps {
  data?: Array<ProductOnShop>;
  loading?: boolean;
}

export default function ShopProductTable({
  data = [],
  loading,
}: ShopProductTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => <ShopProductTableToolbar table={table} />}
    />
  );
}

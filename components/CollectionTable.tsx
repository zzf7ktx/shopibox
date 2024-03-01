"use client";
import { Collection } from "@prisma/client";
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
import { DialogTrigger } from "@/components/ui/Dialog";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { CollectionTableToolbar } from "./CollectionTableToolbar";
import { useState } from "react";
import UpdateCollectionModal, {
  UpdateCollectionDialogs,
} from "./UpdateCollectionModal";
import { getRowRange } from "@/utils";

function ActionDropDown({ row }: { row: Row<Collection> }) {
  const [dialog, setDialog] = useState(UpdateCollectionDialogs.CollectionInfo);
  const collection = row.original;
  return (
    <UpdateCollectionModal
      dialog={dialog}
      collectionId={row.original.id}
      dialogTrigger={
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
            <DropdownMenuItem>View products</DropdownMenuItem>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onClick={() =>
                  setDialog(UpdateCollectionDialogs.CollectionInfo)
                }
              >
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}

let lastSelectedId: number = -1;

const columns: ColumnDef<Collection>[] = [
  {
    id: "select",
    size: 20,
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
              const rowsToToggle = getRowRange(rows, row.index, lastSelectedId);
              const isLastSelected = rowsById[lastSelectedId].getIsSelected();
              rowsToToggle.forEach((row) => row.toggleSelected(isLastSelected));
            }

            lastSelectedId = row.index;
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
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
  },
  {
    id: "actions",
    size: 50,
    cell: ({ row }) => <ActionDropDown row={row} />,
  },
];

export interface CollectionTableProps {
  data?: Array<Collection>;
  loading?: boolean;
}

export default function CollectionTable({
  data = [],
  loading,
}: CollectionTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      toolbar={(table) => <CollectionTableToolbar table={table} />}
    />
  );
}

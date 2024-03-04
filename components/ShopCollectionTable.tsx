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
import { useToast } from "@/components/ui/useToast";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  MinusCircledIcon,
} from "@radix-ui/react-icons";
import { CollectionTableToolbar } from "./CollectionTableToolbar";
import { useParams, useRouter } from "next/navigation";
import { publishCollectionProducts } from "@/actions";
import { useState } from "react";
import { CgSpinnerTwoAlt } from "react-icons/cg";

type CollectionOnShop = Prisma.CollectionGetPayload<{
  include: {
    products: {
      select: {
        productId: true;
        product: {
          include: {
            shops: {
              select: {
                status: true;
                shopId: true;
              };
            };
          };
        };
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
      const noPushed = collection.products.filter(
        (p) => p.product.shops[0]?.status === "Published"
      ).length;
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
      return <ActionCell row={row.original} />;
    },
  },
];

function ActionCell({ row }: { row: CollectionOnShop }) {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);

  if (!id) {
    return;
  }
  const shopId = typeof id === "string" ? id : id[0];

  const pushAll = async () => {
    try {
      setLoading(true);
      await publishCollectionProducts(shopId, row.id);
      toast({
        title: "Success",
        description: `Published all products in this collection to shop`,
      });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: `Something error`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
            onClick={() => navigator.clipboard.writeText(row.id)}
          >
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={pushAll}>Push all</DropdownMenuItem>
          <DropdownMenuItem>Fork and edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {loading && (
        <div className="backdrop-filter backdrop-blur-sm z-50 h-screen w-screen fixed top-0 left-0 flex flex-col items-center justify-center">
          <CgSpinnerTwoAlt className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" />
          <div>{`Don't close. Adding the products...`}</div>
        </div>
      )}
    </>
  );
}

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

"use client";
import { Prisma } from "@prisma/client";
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
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/HoverCard";
import { Badge } from "@/components/ui/Badge";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Checkbox } from "@/components/ui/Checkbox";
import { DialogTrigger } from "@/components/ui/Dialog";
import { DotsHorizontalIcon, ZoomInIcon } from "@radix-ui/react-icons";
import { ProductTableToolbar } from "./ProductTableToolbar";
import UpdateProductModal from "./UpdateProductModal";

type ProductWithCollections = Prisma.ProductGetPayload<{
  include: {
    collections: {
      include: {
        collection: true;
      };
    };
    shops: {
      include: {
        shop: true;
      };
    };
  };
}>;

const columns: ColumnDef<ProductWithCollections>[] = [
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
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name: string = row.getValue("name");
      const description: string = row.original.description ?? "";
      const descriptionHtml: string = row.original.descriptionHtml ?? "";
      return (
        <HoverCard>
          <HoverCardTrigger className="flex gap-1 items-center">
            {name} <ZoomInIcon />
          </HoverCardTrigger>
          <HoverCardContent className="flex gap-1 w-auto max-w-96">
            <div className="basis-1/2">
              <p className="font-500">Plaintext</p>
              <ScrollArea className="h-96">{description}</ScrollArea>
            </div>
            <div className="basis-1/2">
              <p className="font-500">HTML</p>
              <ScrollArea className="h-96">
                <div
                  dangerouslySetInnerHTML={{
                    __html: descriptionHtml,
                  }}
                ></div>
              </ScrollArea>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Category" />;
    },
    cell: ({ row }) => {
      const category: string = row.getValue("category");
      return (
        <>
          {!!category && (
            <HoverCard>
              <HoverCardTrigger>
                <Badge variant="secondary">{category.split(" > ").pop()}</Badge>
              </HoverCardTrigger>
              <HoverCardContent>
                {category.split(" > ").map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="mb-1 last:mb-0"
                  >
                    {item}
                  </Badge>
                ))}
              </HoverCardContent>
            </HoverCard>
          )}
        </>
      );
    },
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
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Shops" />;
    },
    cell: ({ row }) => {
      const collections = row.original.shops;
      return (
        <div className="flex gap-1">
          {collections?.map((item, index) => (
            <Badge key={index} variant="secondary" className="mb-1 last:mb-0">
              {item.shop.name}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, _columnId, value) => {
      return row.original.shops.some((sh) => value.includes(sh.shopId));
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Price" />;
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <UpdateProductModal
          productId={row.original.id}
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
                  onClick={() => navigator.clipboard.writeText(product.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View images</DropdownMenuItem>
                <DialogTrigger asChild>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      );
    },
  },
];

export interface ProductTableProps {
  data?: Array<ProductWithCollections>;
  loading?: boolean;
}

export default function ProductTable({
  data = [],
  loading,
}: ProductTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      toolbar={(table) => <ProductTableToolbar table={table} />}
    />
  );
}

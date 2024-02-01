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
import { getRowRange } from "@/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import Image from "next/image";

type ProductWithCollections = Prisma.ProductGetPayload<{
  include: {
    images: true;
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

let lastSelectedId = "";

const columns: ColumnDef<ProductWithCollections>[] = [
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
    size: 300,
    cell: ({ row }) => {
      const name: string = row.getValue("name");
      const description: string = row.original.description ?? "";
      const descriptionHtml: string = row.original.descriptionHtml ?? "";
      return (
        <div className="flex items-center justify-between whitespace-nowrap overflow-hidden">
          {name}
        </div>
      );
    },
  },

  {
    id: "preview",
    size: 20,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex items-center justify-between overflow-clip">
              <Button variant="ghost" size="icon">
                <ZoomInIcon />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[400px]" asChild>
            <Tabs defaultValue="account" className="w-[400px]">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="plaintext">Plaintext</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
              </TabsList>
              <TabsContent value="plaintext">
                <Card className="grid">
                  <CardHeader>
                    <CardTitle>Desciption</CardTitle>
                    <CardDescription>Desciption in plaintext</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ScrollArea className="max-h-80">
                      {product.description}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="html">
                <Card>
                  <CardHeader>
                    <CardTitle>Desciption HTML</CardTitle>
                    <CardDescription>Desciption in HTML</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ScrollArea className="max-h-80">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: product.descriptionHtml ?? "",
                        }}
                      ></div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="images">
                <ScrollArea className="grid grid-cols-3 gap-1 max-h-80">
                  {product.images &&
                    product.images.map((img, index) => (
                      <Card key={index}>
                        <CardContent className="h-[150px] relative">
                          <Image
                            src={
                              img.cloudLink ?? img.backupLink ?? img.sourceLink
                            }
                            alt={img.name}
                            fill
                          />
                        </CardContent>
                      </Card>
                    ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
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
          <Badge variant="secondary" className="max-w-48">
            {collections?.[0].collection.name}
          </Badge>
          {collections.length > 1 && (
            <Popover>
              <PopoverTrigger asChild>
                <Badge variant="secondary">{collections.length - 1}+</Badge>
              </PopoverTrigger>
              <PopoverContent className="w-[400px]" asChild>
                <div className="flex gap-1">
                  {collections?.slice(1).map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mb-1 last:mb-0"
                    >
                      {item.collection.name}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
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
      const shops = row.original.shops;

      return (
        <div className="flex gap-1">
          {shops.length > 0 && (
            <Badge variant="secondary" className="max-w-48">
              {shops?.[0]?.shop.name}
            </Badge>
          )}
          {shops.length > 1 && (
            <Popover>
              <PopoverTrigger asChild>
                <Badge variant="secondary">{shops.length - 1}+</Badge>
              </PopoverTrigger>
              <PopoverContent className="w-[400px]" asChild>
                <div className="flex gap-1">
                  {shops?.slice(1).map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mb-1 last:mb-0"
                    >
                      {item.shop.name}
                    </Badge>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
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

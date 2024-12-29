"use client";
import {
  Image as ImageInfo,
  ImageSource,
  ImageSyncStatus,
  Prisma,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { syncImage } from "@/actions/manage";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  DotsHorizontalIcon,
  HandIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import { DataTableColumnHeader } from "@/components/ui/DataTableColumnHeader";
import { DataTable } from "@/components/ui/DataTable";
import { DialogTrigger } from "@/components/ui/Dialog";
import { ImageTableToolbar } from "./ImageTableToolbar";
import ViewMetadataModal from "./ViewMetadataModal";
import { getRowRange } from "@/utils";
import { Checkbox } from "./ui/Checkbox";
import Link from "next/link";

type ImageWithProduct = Prisma.ImageGetPayload<{
  include: {
    product: true;
  };
}>;

let lastSelectedId: number = -1;

const columns: ColumnDef<ImageWithProduct>[] = [
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
        aria-label='Select all'
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
          aria-label='Select row'
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Image
              width={150}
              height={90}
              className='h-36'
              src={
                row.original.cloudLink ??
                row.original.backupLink ??
                row.original.sourceLink
              }
              alt={row.original.name}
            ></Image>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <Image
              width={320}
              height={192}
              src={
                row.original.cloudLink ??
                row.original.backupLink ??
                row.original.sourceLink
              }
              alt={row.original.name}
            ></Image>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Source' />
    ),
    cell: ({ row }) => {
      const source = Object.keys(ImageSource).find(
        (source) => source === row.getValue("source")
      );

      if (!source) {
        return null;
      }

      return (
        <div className='flex w-[100px] items-center'>
          {source === ImageSource.Manual ? (
            <HandIcon className='mr-2 h-4 w-4 text-muted-foreground' />
          ) : (
            <RocketIcon className='mr-2 h-4 w-4 text-muted-foreground' />
          )}
          <span>{source}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "product",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Product' />
    ),
    cell: ({ row }) => (
      <Link href={`/products/${row.original.product?.id ?? ""}`}>
        {row.original.product?.name}
      </Link>
    ),
  },

  {
    accessorKey: "syncStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cloud status' />
    ),
    cell: ({ row }) => {
      const status = Object.keys(ImageSyncStatus).find(
        (status) => status === row.getValue("syncStatus")
      );

      if (!status) {
        return null;
      }

      return (
        <div className='flex w-[100px] items-center'>
          {status === ImageSyncStatus.Synced ? (
            <CheckCircledIcon className='mr-2 h-4 w-4 text-green-700' />
          ) : (
            <CrossCircledIcon className='mr-2 h-4 w-4 text-red-700' />
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
    size: 50,
    cell: ({ row }) => <CloudSyncCell image={row.original} />,
  },
];

function CloudSyncCell({ image }: { image: ImageInfo }) {
  const router = useRouter();

  const handleSync = async () => {
    await syncImage(image.id, "default");
    router.refresh();
  };

  return (
    <ViewMetadataModal
      imageId={image.id}
      imageSrc={image.cloudLink}
      dialogTrigger={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(image.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem>View metadata</DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem
              onClick={handleSync}
              disabled={image.syncStatus === ImageSyncStatus.Synced}
            >
              Sync
            </DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    />
  );
}

export interface ImageTableProps {
  data?: Array<ImageWithProduct>;
  loading?: boolean;
}

export default function ImageTable({ data = [], loading }: ImageTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      toolbar={(table) => <ImageTableToolbar table={table} />}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/Input";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { Button } from "@/components/ui/Button";
import {
  CheckCircledIcon,
  ClockIcon,
  Cross2Icon,
  CrossCircledIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { DataTableFacetedFilter } from "@/components/ui/DataTableFacetedFilter";
import { useToast } from "@/components/ui/useToast";
import { getCollections } from "@/actions/manage";
import {
  schedulePublishingProducts,
  setProductsToUnpublished,
} from "@/actions/publish";
import { useParams, useRouter } from "next/navigation";
import { CgSpinnerTwoAlt } from "react-icons/cg";
import { publishProductsInngest } from "@/actions/publish/publishProducts";
import { ProductSyncStatus } from "@prisma/client";

interface Option {
  value: string;
  label: string;
}

interface ShopProductTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ShopProductTableToolbar<TData>({
  table,
}: ShopProductTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [loadingCollections, setLoadingCollection] = useState<boolean>(false);
  const [collections, setCollections] = useState<Option[]>([]);
  const selectedRows = table.getFilteredSelectedRowModel();

  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams();
  const { toast } = useToast();
  const router = useRouter();

  const statuses = Object.entries(ProductSyncStatus).map(([key, value]) => ({
    label: key,
    value: value === ProductSyncStatus.Published ? "Synced" : value,
    icon:
      value === ProductSyncStatus.Published
        ? CheckCircledIcon
        : value === ProductSyncStatus.NotPublished
        ? CrossCircledIcon
        : value === ProductSyncStatus.Processing
        ? RocketIcon
        : ClockIcon,
  }));

  useEffect(() => {
    const getCollectionOptions = async () => {
      setLoadingCollection(true);
      const collections = await getCollections();
      if (collections.success && typeof collections.data !== "string") {
        setCollections(
          collections.data.map((c) => ({
            label: c.name,
            value: c.id,
          }))
        );
      }
      setLoadingCollection(false);
    };
    getCollectionOptions();
  }, []);

  const handleSelectAll = () => {
    const allRowIds = table.options.data.map((row: any) => row.id);
    if (table.getSelectedRowModel().rows.length > 0) {
      table.resetRowSelection();
      return;
    }

    table.setRowSelection(
      allRowIds.reduce((acc, id, index) => {
        acc[index] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };

  const pushProducts = async () => {
    try {
      if (!id) {
        return;
      }

      const shopId = typeof id === "string" ? id : id[0];
      setLoading(true);

      const result = await publishProductsInngest(
        shopId,
        selectedRows.rows.map((r) => (r.original as any).id)
      );

      toast({
        title: "Success",
        description: `Enqueue selected products to push to shop`,
      });

      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: `Something wrong`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const pushShopProducts = async () => {
    try {
      if (!id) {
        return;
      }

      const shopId = typeof id === "string" ? id : id[0];
      setLoading(true);

      const result = await schedulePublishingProducts(shopId);

      toast({
        title: "Success",
        description: `Scheduled publish products to shop`,
      });

      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: `Something wrong`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const forceSetProductsToUnpublished = async () => {
    try {
      if (!id) {
        return;
      }

      const shopId = typeof id === "string" ? id : id[0];
      setLoading(true);

      const result = await setProductsToUnpublished(
        shopId,
        selectedRows.rows.map((r) => (r.original as any).id)
      );

      toast({
        title: "Success",
        description: `Set selected products to unpublished`,
      });

      router.refresh();
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: `Something wrong`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Filter Name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("collections") && (
            <DataTableFacetedFilter
              column={table.getColumn("collections")}
              title="Collections"
              options={collections}
            />
          )}
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          <Button
            variant="outline"
            className="h-8 px-2 lg:px-3"
            onClick={handleSelectAll}
          >
            Select All Products
          </Button>
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
          {selectedRows.rows.length > 0 && (
            <Button
              variant="default"
              className="h-8 px-2 lg:px-3"
              onClick={pushShopProducts}
            >
              Schedule
            </Button>
          )}
          {selectedRows.rows.length > 0 && (
            <Button
              variant="default"
              className="h-8 px-2 lg:px-3"
              onClick={pushProducts}
            >
              Push {`'${selectedRows.rows.length}' products`}
            </Button>
          )}
          {selectedRows.rows.length > 0 && (
            <Button
              variant="destructive"
              className="h-8 px-2 lg:px-3"
              onClick={forceSetProductsToUnpublished}
            >
              Force unpublished {`'${selectedRows.rows.length}' products`}
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
      {loading && (
        <div className="backdrop-filter backdrop-blur-sm z-50 h-screen w-screen fixed top-0 left-0 flex flex-col items-center justify-center">
          <CgSpinnerTwoAlt className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" />
          <div>{`Don't close. Adding the products...`}</div>
        </div>
      )}
    </>
  );
}

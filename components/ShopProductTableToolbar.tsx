"use client";

import { useEffect, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/Input";
import { DataTableViewOptions } from "@/components/ui/DataTableViewOptions";
import { Button } from "@/components/ui/Button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { getCollections } from "@/actions";
import { DataTableFacetedFilter } from "./ui/DataTableFacetedFilter";

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

  useEffect(() => {
    const getCollectionOptions = async () => {
      setLoadingCollection(true);
      const collections = await getCollections();
      setCollections(
        collections.map((c) => ({
          label: c.name,
          value: c.id,
        }))
      );
      setLoadingCollection(false);
    };
    getCollectionOptions();
  }, []);

  return (
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
            onClick={() => {}}
          >
            Push {`'${selectedRows.rows.length}' products`}
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}

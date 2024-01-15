"use client";
import { Collection } from "@prisma/client";
import { Button, Table, TableColumnsType } from "antd";

export interface CollectionTableProps {
  data?: Array<Collection>;
  loading?: boolean;
}

const columns: TableColumnsType<Collection> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Products",
    dataIndex: "products",
    key: "products",
    render: (_, record) => <Button>View</Button>,
  },
];

const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: Collection[]) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
  getCheckboxProps: (record: Collection) => ({
    name: record.id,
  }),
};

export default function CollectionTable({
  data,
  loading,
}: CollectionTableProps) {
  return (
    <Table
      rowSelection={{
        type: "checkbox",
        ...rowSelection,
      }}
      pagination={{
        defaultPageSize: 5,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
      }}
      dataSource={data}
      columns={columns}
      loading={loading}
      rowKey={(p) => p.id}
    />
  );
}

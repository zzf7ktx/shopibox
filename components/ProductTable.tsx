"use client";
import { Product } from "@prisma/client";
import { Button, Popover, Table, TableColumnsType } from "antd";

export interface ProductTableProps {
  data?: Array<Product>;
  loading?: boolean;
}

const columns: TableColumnsType<Product> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "Description Html",
    dataIndex: "descriptionHtml",
    key: "descriptionHtml",
    render: (_, record) => (
      <Popover
        content={
          <div
            dangerouslySetInnerHTML={{ __html: record.descriptionHtml ?? "" }}
          ></div>
        }
        title="HTML preview"
      >
        <Button>Preview</Button>
      </Popover>
    ),
  },
];

const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: Product[]) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
  getCheckboxProps: (record: Product) => ({
    name: record.id,
  }),
};

export default function ProductTable({ data, loading }: ProductTableProps) {
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

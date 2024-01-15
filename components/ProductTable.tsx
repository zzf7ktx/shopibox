"use client";
import { Product, Prisma } from "@prisma/client";
import { Button, Popover, Space, Table, TableColumnsType, Tag } from "antd";

type ProductWithCollections = Prisma.ProductGetPayload<{
  include: {
    collections: {
      include: {
        collection: true;
      };
    };
  };
}>;

export interface ProductTableProps {
  data?: Array<ProductWithCollections>;
  loading?: boolean;
}

const columns: TableColumnsType<ProductWithCollections> = [
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
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    render: (_, record) => (
      <Popover
        content={
          <Space>
            {record.category?.split(" > ").map((catg) => (
              <Tag key={catg} color="geekblue">
                {catg}
              </Tag>
            ))}
          </Space>
        }
      >
        {record.category && (
          <Tag color="geekblue">{record.category.split(" > ").pop()}</Tag>
        )}
      </Popover>
    ),
  },
  {
    title: "Collections",
    dataIndex: "collections",
    key: "collections",
    render: (_, record) => (
      <Space>
        {record.collections?.map((pc) => (
          <Tag key={pc.collection.id} color="geekblue">
            {pc.collection.name}
          </Tag>
        ))}
      </Space>
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

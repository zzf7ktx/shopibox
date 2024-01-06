"use client";
import { Image as ImageInfo, ImageSyncStatus } from "@prisma/client";
import { Badge, Image, Space, Table, TableColumnsType } from "antd";

export interface ImageTableProps {
  data: Array<ImageInfo>;
}

const columns: TableColumnsType<ImageInfo> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <Image
        width={150}
        height={90}
        src={record.cloudLink}
        alt="record.name"
      ></Image>
    ),
  },
  {
    title: "Source",
    dataIndex: "source",
    key: "source",
  },
  {
    title: "Product",
    dataIndex: "productName",
    key: "productName",
  },
  {
    title: "Sync Status",
    dataIndex: "syncStatus",
    key: "syncStatus",
    render: (_, record) => (
      <Badge
        status={
          record.syncStatus === ImageSyncStatus.Synced ? "success" : "warning"
        }
        text={record.syncStatus}
      />
    ),
  },
  {
    title: "Metadata",
    key: "",
    render: (_, record) => (
      <Space size="middle">
        <a>View</a>
      </Space>
    ),
  },
];

export default function Images({ data }: ImageTableProps) {
  return <Table virtual dataSource={data} columns={columns} />;
}

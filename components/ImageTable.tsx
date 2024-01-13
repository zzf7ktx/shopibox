"use client";
import { syncImageWithMainProvider } from "@/actions/syncImageWithMainProvider";
import { CloudSyncOutlined } from "@ant-design/icons";
import { Image as ImageInfo, ImageSyncStatus } from "@prisma/client";
import {
  Badge,
  Button,
  Image,
  Space,
  Table,
  TableColumnsType,
  Tooltip,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ViewMetadataButtonButton from "./ViewMetadataButton";

export interface ImageTableProps {
  data?: Array<ImageInfo>;
  loading?: boolean;
}

const SyncButton = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSync = async () => {
    setLoading(true);
    await syncImageWithMainProvider(id, "default");
    router.refresh();
    setLoading(false);
  };

  return (
    <Tooltip title="Sync">
      <Button
        shape="circle"
        icon={<CloudSyncOutlined />}
        onClick={handleSync}
        loading={loading}
      />
    </Tooltip>
  );
};

const columns: TableColumnsType<ImageInfo> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (_, record) => (
      <Image
        width={150}
        height={90}
        src={record.cloudLink ?? record.backupLink ?? record.sourceLink}
        alt={record.name}
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
      <Space>
        <Badge
          status={
            record.syncStatus === ImageSyncStatus.Synced ? "success" : "warning"
          }
          text={record.syncStatus}
        />
        {record.syncStatus === ImageSyncStatus.NotSync && (
          <SyncButton id={record.id} />
        )}
      </Space>
    ),
  },
  {
    title: "Metadata",
    key: "",
    render: (_, record) => (
      <Space size="middle">
        <ViewMetadataButtonButton
          imageSrc={record.cloudLink}
          imageId={record.id}
        />
      </Space>
    ),
  },
];

const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: ImageInfo[]) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows
    );
  },
  getCheckboxProps: (record: ImageInfo) => ({
    name: record.id,
  }),
};

export default function ImageTable({ data, loading }: ImageTableProps) {
  return (
    <>
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
    </>
  );
}

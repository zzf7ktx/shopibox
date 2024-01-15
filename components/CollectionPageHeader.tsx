"use client";
import { SyncOutlined } from "@ant-design/icons";
import { Flex, Space, Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
const { Title } = Typography;

export interface CollectionPageHeaderProps {}

export default function CollectionPageHeader({}: CollectionPageHeaderProps) {
  const router = useRouter();
  const handleRefresh = async () => {
    startTransition(() => router.refresh());
  };
  return (
    <Flex justify="space-between">
      <Space>
        <Title level={4}>Collection management</Title>
        <Button
          shape="circle"
          icon={<SyncOutlined />}
          onClick={handleRefresh}
        />
      </Space>
    </Flex>
  );
}

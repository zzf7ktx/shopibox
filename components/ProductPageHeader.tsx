"use client";
import { SyncOutlined } from "@ant-design/icons";
import { Flex, Space, Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import { startTransition } from "react";
import AddManualProductButton from "./AddManualProductButton";
const { Title } = Typography;

export interface ProductPageHeaderProps {}

export default function ProductPageHeader({}: ProductPageHeaderProps) {
  const router = useRouter();
  const handleRefresh = async () => {
    startTransition(() => router.refresh());
  };
  return (
    <Flex justify="space-between">
      <Space>
        <Title level={4}>Product management</Title>
        <Button
          shape="circle"
          icon={<SyncOutlined />}
          onClick={handleRefresh}
        />
      </Space>
      <AddManualProductButton />
    </Flex>
  );
}

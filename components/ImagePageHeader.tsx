"use client";
import { SyncOutlined } from "@ant-design/icons";
import { Flex, Space, Button, Typography } from "antd";
import UploadManualButton from "./UploadManualButton";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
const { Title } = Typography;

export interface ImagePageHeaderProps {}

export default function ImagePageHeader({}: ImagePageHeaderProps) {
  const router = useRouter();
  const handleRefresh = async () => {
    startTransition(() => router.refresh());
  };
  return (
    <Flex justify="space-between">
      <Space>
        <Title level={4}>Image management</Title>
        <Button
          shape="circle"
          icon={<SyncOutlined />}
          onClick={handleRefresh}
        />
      </Space>
      <UploadManualButton />
    </Flex>
  );
}

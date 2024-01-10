"use client";

import { Product } from "@prisma/client";
import { Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";
import metadata, { MetaTags, RawMetadata } from "@/lib/metadata";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 21 },
};

export interface ViewMetadataButtonModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
}

export default function ViewMetadataButtonModal({
  open,
  onClose,
  imageSrc,
}: ViewMetadataButtonModalProps) {
  const [loading, setLoading] = useState<boolean>(false);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const [form] = Form.useForm();

  const onFinish = async (values: {}) => {
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    const getMetadata = async () => {
      if (!imageSrc || !open) {
        return;
      }

      let base64: string = await metadata.getBase64Image(imageSrc);
      let meta: RawMetadata = metadata.load(base64);

      form.setFieldValue(
        MetaTags.XPSubject,
        metadata.decimalArrayToString(
          metadata.getMetaByTag(meta, MetaTags.XPSubject) ?? []
        )
      );
      form.setFieldValue(
        MetaTags.XPTitle,
        metadata.decimalArrayToString(
          metadata.getMetaByTag(meta, MetaTags.XPTitle) ?? []
        )
      );
      form.setFieldValue(
        MetaTags.XPKeywords,
        metadata.decimalArrayToString(
          metadata.getMetaByTag(meta, MetaTags.XPKeywords) ?? []
        )
      );
      form.setFieldValue(
        MetaTags.ImageDescription,
        metadata.getMetaByTag(meta, MetaTags.ImageDescription)
      );
    };
    getMetadata();
  }, [imageSrc, open]);

  return (
    <Modal
      title="Image metadata"
      open={open}
      onOk={form.submit}
      okText="Save"
      confirmLoading={loading}
      onCancel={handleCancel}
      okButtonProps={{ htmlType: "submit" }}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name={MetaTags.ImageDescription} label="ImageDescription">
          <Input size="large" placeholder="ImageDescription" />
        </Form.Item>
        <Form.Item name={MetaTags.XPSubject} label="XPSubject">
          <Input size="large" placeholder="XPSubject" />
        </Form.Item>
        <Form.Item name={MetaTags.XPTitle} label="XPTitle">
          <Input size="large" placeholder="XPTitle" />
        </Form.Item>
        <Form.Item name={MetaTags.XPKeywords} label="XPKeywords">
          <Input size="large" placeholder="XPKeywords" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

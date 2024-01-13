"use client";

import { Form, Input, Modal, message } from "antd";
import { useEffect, useState } from "react";
import metadata, { MetaTags, RawMetadata } from "@/lib/metadata";
import { updateMetadata } from "@/actions";
import { useRouter } from "next/navigation";

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 21 },
};

export interface ViewMetadataButtonModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  imageId: string;
}

export default function ViewMetadataButtonModal({
  open,
  onClose,
  imageSrc,
  imageId,
}: ViewMetadataButtonModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string>("");
  const [meta, setMeta] = useState<RawMetadata>();
  const router = useRouter();

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const [form] = Form.useForm();

  const onFinish = async (values: Record<MetaTags, string>) => {
    try {
      setLoading(true);

      let newMeta: RawMetadata = meta!;
      for (let code of Object.values(MetaTags)) {
        newMeta = metadata.setMetaByTag(newMeta, code, values[code]);
      }

      const newExifBinary = metadata.dump(newMeta!);
      const newPhotoData = metadata.insert(newExifBinary, imageData);
      let fileBuffer = Buffer.from(newPhotoData, "binary");
      const blob = new Blob([fileBuffer]);

      let data = new FormData();
      data.append("file", blob);

      await updateMetadata(imageId, data);
      setLoading(false);
      message.success("Update image metadata successfully");
      onClose();
      router.refresh();
    } catch (error) {
      console.log(error);
      message.error("Something wrong");
    }
  };

  useEffect(() => {
    const getMetadata = async () => {
      if (!imageSrc || !open) {
        return;
      }

      let base64: string = await metadata.getBase64Image(imageSrc);
      setImageData(base64);
      let originalMeta: RawMetadata = metadata.load(base64);
      setMeta(originalMeta);

      for (let code of Object.values(MetaTags)) {
        let fieldValue = metadata.getMetaByTag(originalMeta, code);
        if (!fieldValue) {
          continue;
        }

        if (typeof fieldValue === "string") {
          form.setFieldValue(code, metadata.getMetaByTag(originalMeta, code));
        } else {
          form.setFieldValue(
            code,
            metadata.decimalArrayToString(
              metadata.getMetaByTag(originalMeta, code)
            )
          );
        }
      }
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
        {Object.entries(MetaTags).map(([tag, code]) => (
          <Form.Item key={code} name={code} label={tag}>
            <Input size="large" placeholder={tag} />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
}

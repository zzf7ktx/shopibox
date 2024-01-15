"use client";

import { Collection } from "@prisma/client";
import { Form, Input, Modal, message } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addCollection } from "@/actions";

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 21 },
};

export interface AddManualCollectionModalProps {
  open: boolean;
  onClose: (value?: Collection) => void;
}

export interface AddCollectionFormFields {
  name: string;
}

export default function AddManualCollectionModal({
  open,
  onClose,
}: AddManualCollectionModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  const [form] = Form.useForm();

  const onFinish = async (values: AddCollectionFormFields) => {
    try {
      setLoading(true);

      const newCollection = await addCollection(values);

      message.success("Add collection successfully", () =>
        message.info("Add some product to this collection")
      );

      form.resetFields();
      router.refresh();
      onClose(newCollection);
    } catch (error) {
      message.error("Something wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add collection manually"
      open={open}
      onOk={form.submit}
      okText="Submit"
      confirmLoading={loading}
      onCancel={handleCancel}
      okButtonProps={{ htmlType: "submit" }}
    >
      <Form
        {...layout}
        form={form}
        name="add-manual-collection-form"
        onFinish={onFinish}
      >
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input size="large" placeholder="Name" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

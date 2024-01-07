"use client";

import { Product } from "@prisma/client";
import { Form, Input, InputNumber, Modal } from "antd";
import { useState } from "react";
import { addProduct } from "@/actions";
import { useRouter } from "next/navigation";

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 21 },
};

export interface AddManualProductModalProps {
  open: boolean;
  onClose: (value?: Product) => void;
  productKey?: string;
}

export interface AddProductFormFields {
  name: string;
  price: string;
  description: string;
  descriptionHtml: string;
}
export default function AddManualProductModal({
  open,
  onClose,
}: AddManualProductModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  const [form] = Form.useForm();

  const onFinish = async (values: AddProductFormFields) => {
    setLoading(true);
    const newProduct = await addProduct(values);
    router.refresh();
    setLoading(false);
    form.resetFields();
    onClose(newProduct);
  };

  return (
    <Modal
      title="Add product manual"
      open={open}
      onOk={form.submit}
      okText="Submit"
      confirmLoading={loading}
      onCancel={handleCancel}
      okButtonProps={{ htmlType: "submit" }}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input size="large" placeholder="Name" />
        </Form.Item>
        <Form.Item label="Price" name="price" rules={[{ required: true }]}>
          <InputNumber size="large" placeholder="Price" className="w-full" />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input.TextArea size="large" placeholder="Description" />
        </Form.Item>
        <Form.Item
          label="HTML"
          name="descriptionHtml"
          rules={[{ required: true }]}
        >
          <Input.TextArea size="large" placeholder="Description HTML" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

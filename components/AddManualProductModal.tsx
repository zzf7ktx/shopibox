"use client";

import { Product } from "@prisma/client";
import { Cascader, Form, Input, InputNumber, Modal, message } from "antd";
import { useEffect, useState } from "react";
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
  price: number;
  description: string;
  descriptionHtml: string;
  category: string[];
}

interface Option {
  value: string;
  label: string;
  children: Option[];
}

async function convertTxtToJS(url: string): Promise<Array<Option>> {
  try {
    const res = await fetch(url);
    const dataStr = await res.text();
    const lines = dataStr.split("\n");
    const catgoriesObject: any = {};

    for (const line of lines) {
      const fields = line.split("-");
      if (fields.length < 2) {
        continue;
      }

      let categories = fields[1].split(" > ");

      let subCatg = catgoriesObject;
      for (let catg of categories) {
        subCatg[catg.trim()] = {} as any;
        subCatg = subCatg[catg.trim()];
      }
    }

    const result: Option[] = [];
    const stack = [{ catgoriesObject, parent: result }];
    while (stack.length > 0) {
      const { catgoriesObject, parent } = stack.pop()!;
      for (const [key, value] of Object.entries(catgoriesObject)) {
        const newObj: Option = {
          label: key,
          value: key,
          children: [],
        };
        parent.push(newObj);
        stack.push({ catgoriesObject: value, parent: newObj.children });
      }
    }
    return result;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export default function AddManualProductModal({
  open,
  onClose,
}: AddManualProductModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCatgories] = useState<Option[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getCagtegories = async () => {
      const result = await convertTxtToJS(
        "https://res.cloudinary.com/dtp8svzny/raw/upload/v1705205941/shopify/product_taxonomy_byh5fo.txt"
      );
      setCatgories(result);
    };
    getCagtegories();
  }, []);

  const handleCancel = () => {
    onClose();
    form.resetFields();
  };

  const [form] = Form.useForm();

  const onFinish = async (values: AddProductFormFields) => {
    try {
      setLoading(true);

      const newProduct = await addProduct(values);

      message.success("Add product successfully", () =>
        message.info("Upload some images for this product")
      );

      form.resetFields();
      router.refresh();
      onClose(newProduct);
    } catch (error) {
      message.error("Something wrong");
    } finally {
      setLoading(false);
    }
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
      <Form
        {...layout}
        form={form}
        name="add-manual-product-form"
        onFinish={onFinish}
      >
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
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true }]}
        >
          <Cascader
            size="large"
            options={categories}
            placeholder="Please select"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

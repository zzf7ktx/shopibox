"use client";

import { BorderlessTableOutlined, InboxOutlined } from "@ant-design/icons";
import { Product } from "@prisma/client";
import {
  AutoComplete,
  Form,
  Input,
  Modal,
  Upload,
  UploadProps,
  message,
} from "antd";
import { ReactNode, useEffect, useState } from "react";
import { getProducts, uploadImages } from "@/actions";
import { useRouter } from "next/navigation";
const { Dragger } = Upload;

const layout = {
  wrapperCol: { span: 24 },
};

export interface UploadManualModalProps {
  open: boolean;
  onClose: () => void;
  productKey?: string;
}

interface ProductOption {
  value: string;
  label: ReactNode;
  product: Product;
}

const renderItem = (product: Product): ProductOption => ({
  value: product.id,
  label: (
    <div
      key={product.id}
      style={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {product.name ?? "Item"}
      <span>
        <BorderlessTableOutlined /> {product.id}
      </span>
    </div>
  ),
  product,
});

const props: UploadProps = {
  name: "file",
  multiple: true,
  action: "",
  onChange(info) {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log("Dropped files", e.dataTransfer.files);
  },
  beforeUpload: () => false,
};

export interface UploadImagesFormFields {
  product: Product;
  files: FileList;
}

export default function UploadManualModal({
  open,
  onClose,
  productKey,
}: UploadManualModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const router = useRouter();

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const [form] = Form.useForm();

  const onFinish = async (values: {
    files: { file: any; fileList: any[] };
    product: string;
  }) => {
    setLoading(true);
    let data = new FormData();
    for (let i = 0; i < values.files.fileList.length; i++) {
      data.append("files", values.files.fileList[i].originFileObj);
    }
    await uploadImages(values.product, data);
    router.refresh();
    setLoading(false);
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    const getProductOptions = async () => {
      setLoadingProducts(true);
      const products = await getProducts();
      setProductOptions(products.map((p) => renderItem(p)));
      setLoadingProducts(false);
    };
    getProductOptions();

    if (!!productKey) {
      form.setFieldValue("product", productKey);
    }
  }, [productKey]);

  return (
    <Modal
      title="Upload images manual"
      open={open}
      onOk={form.submit}
      okText="Submit"
      confirmLoading={loading}
      onCancel={handleCancel}
      okButtonProps={{ htmlType: "submit" }}
    >
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="product" rules={[{ required: true }]}>
          <AutoComplete
            popupClassName="choose-product-autocomplete__popup"
            options={productOptions}
            disabled={!!productKey}
          >
            <Input.Search
              size="large"
              placeholder="Choose product"
              loading={loadingProducts}
            />
          </AutoComplete>
        </Form.Item>
        <Form.Item name="files" rules={[{ required: true }]}>
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Dragger>
        </Form.Item>
      </Form>
    </Modal>
  );
}

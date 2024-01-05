"use client";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Button, Layout, Menu, theme } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import "./main.css";
import Link from "next/link";
import MenuItem from "antd/es/menu/MenuItem";
import { usePathname, useRouter } from "next/navigation";

const { Header, Sider, Content } = Layout;

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Image management",
//   description: "Image management",
// };

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathName = usePathname();
  
  return (
    <Layout className="h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">Shopify Tools</div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={[pathName]}>
          <MenuItem key="/main/products" icon={<ShoppingOutlined />}>
            <Link href="products">
              Products
            </Link>
          </MenuItem>
          <MenuItem key="/main/images" icon={<VideoCameraOutlined />}>
            <Link href="images">
              Images
            </Link>
          </MenuItem>
          <MenuItem key="3" icon={<UploadOutlined />}>
            Comming soon
          </MenuItem>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

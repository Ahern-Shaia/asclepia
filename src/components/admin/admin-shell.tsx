"use client";

import {
  AppstoreOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  ProfileOutlined,
  SettingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  ConfigProvider,
  Drawer,
  Flex,
  Layout,
  Menu,
  theme,
  Typography,
} from "antd";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { type ReactNode, useState } from "react";
import { MockBanner } from "@/components/catalog/mock-banner";
import { adminCopy } from "@/copy/admin";
import { adminTheme } from "@/theme/tokens";
import styles from "./admin.module.css";

export type AdminSection = "products" | "categories" | "inquiries" | "attributes" | "settings";
// Sections the real back office has built so far; the mockup shows every section. Add a section
// here when its page exists, so the menu never links to a 404.
const LIVE: AdminSection[] = ["products", "categories", "inquiries", "attributes"];
type ShellProps = {
  base: string;
  active: AdminSection;
  newInquiries?: number; // NEW inquiries, shown as the menu badge
  user: string;
  mock?: boolean;
  children: ReactNode;
};

export function AdminShell(props: ShellProps) {
  return (
    <ConfigProvider theme={adminTheme}>
      <AdminShellInner {...props} />
    </ConfigProvider>
  );
}

function AdminNav({
  base,
  active,
  newInquiries,
  mock,
  onNavigate,
}: {
  base: string;
  active: AdminSection;
  newInquiries?: number;
  mock?: boolean;
  onNavigate?: () => void;
}) {
  const m = adminCopy.menu;
  const items = [
    {
      key: "products",
      icon: <AppstoreOutlined />,
      label: <Link href={`${base}/products`}>{m.products}</Link>,
    },
    {
      key: "categories",
      icon: <TagsOutlined />,
      // the mockup has no categories page
      label: mock ? m.categories : <Link href={`${base}/categories`}>{m.categories}</Link>,
    },
    {
      key: "inquiries",
      icon: <MessageOutlined />,
      label: (
        <Link href={`${base}/inquiries`}>
          <Flex justify="space-between" align="center">
            {m.inquiries}
            {!!newInquiries && <Badge count={newInquiries} title={`${newInquiries} 筆未處理`} />}
          </Flex>
        </Link>
      ),
    },
    {
      key: "attributes",
      icon: <ProfileOutlined />,
      label: <Link href={`${base}/attributes`}>{m.attributes}</Link>,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: <Link href={`${base}/settings`}>{m.settings}</Link>,
    },
  ];
  return (
    <Menu
      mode="inline"
      selectedKeys={[active]}
      style={{ borderInlineEnd: "none" }}
      onClick={onNavigate}
      items={mock ? items : items.filter((i) => LIVE.includes(i.key as AdminSection))}
    />
  );
}

function AdminShellInner({ base, active, newInquiries, user, mock, children }: ShellProps) {
  const { token } = theme.useToken();
  const [navOpen, setNavOpen] = useState(false);
  const brand = (
    <Link
      href={`${base}/products`}
      style={{ fontWeight: 700, fontSize: token.fontSizeLG, color: token.colorPrimary }}
    >
      {adminCopy.appName}
    </Link>
  );
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {mock && <MockBanner />}
      <Layout>
        <Layout.Sider
          width={220}
          className={styles.desktopOnly}
          style={{ borderInlineEnd: `1px solid ${token.colorBorder}` }}
        >
          <Flex vertical gap={8} style={{ paddingBlockStart: 18 }}>
            <div style={{ paddingInline: 20 }}>{brand}</div>
            <AdminNav base={base} active={active} newInquiries={newInquiries} mock={mock} />
          </Flex>
        </Layout.Sider>
        <Layout>
          <Layout.Header
            style={{
              borderBottom: `1px solid ${token.colorBorder}`,
              paddingInline: 16,
              height: 56,
              lineHeight: "56px",
            }}
          >
            <Flex align="center" gap={12} style={{ height: "100%" }}>
              <Button
                className={styles.mobileOnly}
                type="text"
                icon={<MenuOutlined />}
                aria-label="開啟選單"
                onClick={() => setNavOpen(true)}
              />
              <div className={styles.mobileOnly}>{brand}</div>
              <div aria-hidden style={{ flex: 1 }} />
              <Avatar size="small" style={{ background: token.colorPrimary }} aria-label={user}>
                {user.slice(0, 1).toUpperCase()}
              </Avatar>
              <Typography.Text className={styles.desktopOnly}>{user}</Typography.Text>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                {...(mock
                  ? { href: `${base}/login` }
                  : { onClick: () => void signOut({ callbackUrl: `${base}/login` }) })}
              >
                {adminCopy.logout}
              </Button>
            </Flex>
          </Layout.Header>
          <Layout.Content className={styles.content}>{children}</Layout.Content>
        </Layout>
      </Layout>
      <Drawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        placement="left"
        size="default"
        title={adminCopy.appName}
      >
        <AdminNav
          base={base}
          active={active}
          newInquiries={newInquiries}
          mock={mock}
          onNavigate={() => setNavOpen(false)}
        />
      </Drawer>
    </Layout>
  );
}

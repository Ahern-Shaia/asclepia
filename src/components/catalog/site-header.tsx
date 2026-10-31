"use client";

import { MenuOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Input, Menu, theme } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { catalogCopy } from "@/copy/catalog";
import { siteCopy } from "@/copy/site";
import styles from "./catalog.module.css";

export function CatalogHeader({ base }: { base: string }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const search = (q: string) =>
    router.push(`${base}/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  const nav = [
    { key: "products", label: <Link href={`${base}/products`}>{catalogCopy.nav.products}</Link> },
    { key: "services", label: <Link href={`${base}#services`}>{catalogCopy.nav.services}</Link> },
    { key: "contact", label: <Link href={`${base}#contact`}>{catalogCopy.nav.contact}</Link> },
  ];

  return (
    <header
      style={{ background: token.colorBgContainer, borderBottom: `1px solid ${token.colorBorder}` }}
    >
      <Flex className={`${styles.container} ${styles.headerRow}`} align="center" gap={24}>
        <Link href={base} aria-label={`${siteCopy.name} 首頁`}>
          <Flex vertical gap={0}>
            <span
              style={{
                fontSize: token.fontSizeHeading3,
                fontWeight: 700,
                color: token.colorPrimary,
                lineHeight: 1.2,
              }}
            >
              {siteCopy.name}
            </span>
            <span
              style={{
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary,
                lineHeight: 1.2,
              }}
            >
              {siteCopy.tagline}
            </span>
          </Flex>
        </Link>
        <div className={`${styles.headerSearch} ${styles.desktopOnly}`}>
          <Input.Search
            placeholder={catalogCopy.search.placeholder}
            aria-label={catalogCopy.search.placeholder}
            enterButton={catalogCopy.search.button}
            onSearch={search}
            allowClear
          />
        </div>
        <div aria-hidden style={{ flex: 1 }} />
        <nav className={styles.desktopOnly} aria-label="主選單">
          <Menu
            mode="horizontal"
            items={nav}
            selectable={false}
            style={{ borderBottom: "none", minWidth: 320 }}
          />
        </nav>
        <Flex className={styles.mobileOnly} gap={4}>
          <Button
            type="text"
            size="large"
            icon={<SearchOutlined />}
            aria-label={catalogCopy.search.button}
            onClick={() => setOpen(true)}
          />
          <Button
            type="text"
            size="large"
            icon={<MenuOutlined />}
            aria-label="開啟選單"
            onClick={() => setOpen(true)}
          />
        </Flex>
      </Flex>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        placement="right"
        size="default"
        title={siteCopy.name}
      >
        <Flex vertical gap={16}>
          <Input.Search
            placeholder={catalogCopy.search.placeholder}
            enterButton
            onSearch={(q) => {
              setOpen(false);
              search(q);
            }}
          />
          <Menu
            mode="vertical"
            items={nav}
            selectable={false}
            style={{ borderInlineEnd: "none" }}
            onClick={() => setOpen(false)}
          />
        </Flex>
      </Drawer>
    </header>
  );
}

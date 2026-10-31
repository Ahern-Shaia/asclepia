"use client";

import { FilterOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Drawer,
  Empty,
  Flex,
  Menu,
  Pagination,
  Select,
  Skeleton,
  theme,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { catalogCopy } from "@/copy/catalog";
import styles from "./catalog.module.css";
import { type CardProduct, ProductCard } from "./product-card";

export type ListProduct = CardProduct & { categoryId: string };
type Category = { id: string; name: string; count: number };

const c = catalogCopy.list;

export function ListView({
  base,
  categories,
  brands,
  products,
}: {
  base: string;
  categories: Category[];
  brands: string[];
  products: ListProduct[];
}) {
  const { token } = theme.useToken();
  const router = useRouter();
  const params = useSearchParams();
  const cat = params.get("cat") ?? "";
  const q = params.get("q") ?? "";
  const loading = params.get("state") === "loading";
  const [filterOpen, setFilterOpen] = useState(false);
  const [checkedBrands, setCheckedBrands] = useState<string[]>([]);

  const shown = products.filter(
    (p) =>
      (!cat || p.categoryId === cat) &&
      (!q ||
        `${p.brand} ${p.model} ${p.nameZh} ${p.licenseNo ?? ""}`
          .toLowerCase()
          .includes(q.toLowerCase())) &&
      (checkedBrands.length === 0 || checkedBrands.includes(p.brand)),
  );
  const current = categories.find((x) => x.id === cat);
  const go = (next: { cat?: string; q?: string }) => {
    const sp = new URLSearchParams();
    if (next.cat) sp.set("cat", next.cat);
    if (next.q) sp.set("q", next.q);
    router.push(`${base}/products${sp.size ? `?${sp}` : ""}`);
  };

  const filters = (
    <Flex vertical gap={16}>
      <Menu
        mode="inline"
        selectedKeys={[cat || "all"]}
        style={{ borderInlineEnd: "none" }}
        onClick={({ key }) => {
          setFilterOpen(false);
          go({ cat: key === "all" ? "" : key, q });
        }}
        items={[
          {
            key: "all",
            label: (
              <Flex justify="space-between">
                <span>{c.allCategories}</span>
                <span>{categories.reduce((n, x) => n + x.count, 0)}</span>
              </Flex>
            ),
          },
          ...categories.map((x) => ({
            key: x.id,
            label: (
              <Flex justify="space-between">
                <span>{x.name}</span>
                <span style={{ color: token.colorTextSecondary }}>{x.count}</span>
              </Flex>
            ),
          })),
        ]}
      />
      <fieldset style={{ border: "none", padding: 0 }}>
        <legend style={{ fontWeight: 600, paddingBlockEnd: 8 }}>{c.brand}</legend>
        <Checkbox.Group value={checkedBrands} onChange={(v) => setCheckedBrands(v as string[])}>
          <Flex vertical gap={8}>
            {brands.map((b) => (
              <Checkbox key={b} value={b}>
                {b}
              </Checkbox>
            ))}
          </Flex>
        </Checkbox.Group>
      </fieldset>
    </Flex>
  );

  return (
    <Flex className={styles.container} vertical gap={16} style={{ paddingBlock: 24 }}>
      <Breadcrumb
        items={[
          { title: <Link href={base}>首頁</Link> },
          { title: <Link href={`${base}/products`}>{catalogCopy.nav.products}</Link> },
          ...(current ? [{ title: current.name }] : []),
        ]}
      />
      <Typography.Title level={1}>
        {q ? `「${q}」的搜尋結果` : (current?.name ?? catalogCopy.nav.products)}
      </Typography.Title>
      <div className={styles.listLayout}>
        <aside className={styles.desktopOnly} aria-label={c.filters}>
          <Card variant="outlined" styles={{ body: { padding: 8 } }}>
            {filters}
          </Card>
        </aside>
        <Flex vertical gap={16}>
          <Flex justify="space-between" align="center" gap={8} wrap>
            <Typography.Text type="secondary">
              {loading ? " " : c.count(shown.length)}
            </Typography.Text>
            <Flex gap={8}>
              <Button
                className={styles.mobileOnly}
                icon={<FilterOutlined />}
                onClick={() => setFilterOpen(true)}
              >
                {c.filters}
              </Button>
              <Select
                aria-label="排序"
                defaultValue="newest"
                style={{ width: 140 }}
                options={[
                  { value: "newest", label: c.sort.newest },
                  { value: "priceAsc", label: c.sort.priceAsc },
                  { value: "priceDesc", label: c.sort.priceDesc },
                ]}
              />
            </Flex>
          </Flex>
          {loading ? (
            <div className={styles.grid} aria-busy="true">
              {Array.from({ length: 8 }, (_, i) => (
                <Card
                  key={i}
                  variant="outlined"
                  cover={
                    <div className={styles.cover} style={{ background: token.colorBgLayout }} />
                  }
                >
                  <Skeleton active paragraph={{ rows: 2 }} title={false} />
                </Card>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <Card variant="outlined">
              <Empty
                description={
                  <Flex vertical gap={4}>
                    <Typography.Text strong>{c.emptyTitle}</Typography.Text>
                    <Typography.Text type="secondary">{c.emptyHint}</Typography.Text>
                  </Flex>
                }
              >
                <Flex gap={8} justify="center">
                  <Button
                    onClick={() => {
                      setCheckedBrands([]);
                      go({});
                    }}
                  >
                    {c.clearFilters}
                  </Button>
                  <Button type="primary" href="#contact">
                    {c.askUs}
                  </Button>
                </Flex>
              </Empty>
            </Card>
          ) : (
            <>
              <div className={styles.grid}>
                {shown.map((p) => (
                  <ProductCard key={p.id} product={p} href={`${base}/products/${p.id}`} />
                ))}
              </div>
              <Flex justify="center">
                <Pagination total={shown.length} pageSize={48} hideOnSinglePage={false} />
              </Flex>
            </>
          )}
        </Flex>
      </div>
      <Drawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title={c.filters}
        placement="left"
      >
        {filters}
      </Drawer>
    </Flex>
  );
}

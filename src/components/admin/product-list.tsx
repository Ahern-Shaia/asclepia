"use client";

import { PictureOutlined, PlusOutlined } from "@ant-design/icons";
import { Card, Empty, Flex, Input, Segmented, Select, Table, theme, Typography } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatTwd } from "@/components/catalog/format";
import { adminCopy } from "@/copy/admin";
import { PRODUCT_STATUSES, type ProductStatus } from "./catalog-data";
import { LinkButton } from "./link-button";
import { ProductStatusTag } from "./status";

export type ProductRow = {
  id: string;
  name: string;
  title: string;
  category: string;
  status: ProductStatus;
  priceTwd: number | null;
  updatedAt: string;
  imageCount: number;
};

type Filters = { status: string; category: string; q: string; paged: boolean };

const p = adminCopy.products;

// Back-office product list (catalog.md A1). Filters live in the URL; paging is keyset ("下一頁").
export function ProductList({
  rows,
  nextCursor,
  filters,
  categories,
  pageSize,
}: {
  rows: ProductRow[];
  nextCursor: string | null;
  filters: Filters;
  categories: { id: string; name: string }[];
  pageSize: number;
}) {
  const { token } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();
  const href = (patch: Partial<Record<"status" | "category" | "q" | "cursor", string>>) => {
    const next = new URLSearchParams();
    const merged = { status: filters.status, category: filters.category, q: filters.q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const filtered = !!(filters.status || filters.category || filters.q);

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
          {p.title}
        </Typography.Title>
        {categories.length > 0 && (
          <LinkButton href="/admin/products/new" type="primary" icon={<PlusOutlined />}>
            {p.create}
          </LinkButton>
        )}
      </Flex>
      <Card variant="outlined" styles={{ body: { padding: 16 } }}>
        <Flex vertical gap={16}>
          <Flex gap={12} wrap>
            <Input.Search
              key={filters.q}
              defaultValue={filters.q}
              placeholder={p.searchPlaceholder}
              aria-label={p.searchPlaceholder}
              allowClear
              maxLength={100}
              onSearch={(q) => router.push(href({ q: q.trim() }))}
              style={{ maxWidth: 360 }}
            />
            <Select
              aria-label={p.categoryFilter}
              showSearch={{ optionFilterProp: "label" }}
              style={{ width: 180 }}
              value={filters.category}
              onChange={(category: string) => router.push(href({ category }))}
              options={[
                { value: "", label: p.allCategories },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Flex>
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Segmented
              aria-label={p.statusFilter}
              value={filters.status || "ALL"}
              onChange={(v) => router.push(href({ status: v === "ALL" ? "" : String(v) }))}
              options={(["ALL", ...PRODUCT_STATUSES] as const).map((s) => ({
                value: s,
                label: s === "ALL" ? p.all : adminCopy.status[s],
              }))}
            />
          </div>
          <Table<ProductRow>
            rowKey="id"
            dataSource={rows}
            pagination={false}
            scroll={{ x: 900 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    filtered ? p.noMatch : categories.length ? p.empty : p.emptyNoCategory
                  }
                >
                  {filtered ? (
                    <LinkButton href={pathname}>{p.clearFilters}</LinkButton>
                  ) : (
                    !categories.length && (
                      <LinkButton href="/admin/categories" type="primary">
                        {p.goCategories}
                      </LinkButton>
                    )
                  )}
                </Empty>
              ),
            }}
            columns={[
              {
                title: p.columns.image,
                key: "image",
                width: 88,
                render: (_, r) => (
                  <Flex
                    align="center"
                    justify="center"
                    role="img"
                    aria-label={p.photos(r.imageCount)}
                    style={{
                      width: 64,
                      height: 48,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: token.borderRadiusSM,
                      background: token.colorBgLayout,
                      color: token.colorTextSecondary,
                    }}
                  >
                    <PictureOutlined aria-hidden />
                  </Flex>
                ),
              },
              {
                title: p.columns.name,
                key: "name",
                render: (_, r) => (
                  <Flex vertical>
                    <Link href={`/admin/products/${r.id}`}>{r.title || r.name || p.untitled}</Link>
                    {r.title && (
                      <Typography.Text type="secondary">{r.name || p.untitled}</Typography.Text>
                    )}
                  </Flex>
                ),
              },
              { title: p.columns.category, dataIndex: "category", width: 140 },
              {
                title: p.columns.status,
                dataIndex: "status",
                width: 110,
                render: (s: ProductStatus) => <ProductStatusTag status={s} />,
              },
              {
                title: p.columns.price,
                dataIndex: "priceTwd",
                width: 140,
                align: "right",
                render: (v: number | null) =>
                  v === null ? (
                    <Typography.Text type="secondary">{p.askPriceFull}</Typography.Text>
                  ) : (
                    formatTwd(v)
                  ),
              },
              { title: p.columns.updatedAt, dataIndex: "updatedAt", width: 150 },
              {
                title: p.columns.actions,
                key: "actions",
                width: 90,
                render: (_, r) => (
                  <LinkButton
                    href={`/admin/products/${r.id}`}
                    size="small"
                    aria-label={`${p.edit}「${r.title || r.name || p.untitled}」`}
                  >
                    {p.edit}
                  </LinkButton>
                ),
              },
            ]}
          />
          <Flex justify="space-between" align="center" gap={12} wrap>
            <Typography.Text type="secondary">{p.pageNote(pageSize)}</Typography.Text>
            <Flex gap={8}>
              {filters.paged && <LinkButton href={href({})}>{p.first}</LinkButton>}
              {nextCursor && <LinkButton href={href({ cursor: nextCursor })}>{p.next}</LinkButton>}
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

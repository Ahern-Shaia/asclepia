"use client";

import { DownOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Flex,
  Input,
  Segmented,
  Select,
  Table,
  theme,
  Typography,
} from "antd";
import Link from "next/link";
import { useState } from "react";
import { formatTwd } from "@/components/catalog/format";
import { adminCopy } from "@/copy/admin";
import { ProductStatusTag } from "./status";

export type AdminProductRow = {
  id: string;
  image: string;
  brand: string;
  model: string;
  nameZh: string;
  category: string;
  priceTwd?: number;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN" | "SOLD";
  updatedAt: string;
};

const p = adminCopy.products;

export function ProductsView({
  base,
  rows,
  categories,
}: {
  base: string;
  rows: AdminProductRow[];
  categories: { id: string; name: string }[];
}) {
  const { token } = theme.useToken();
  const [status, setStatus] = useState<string>("ALL");
  const counts = (s: string) =>
    s === "ALL" ? rows.length : rows.filter((r) => r.status === s).length;
  const shown = status === "ALL" ? rows : rows.filter((r) => r.status === status);

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center">
        <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
          {p.title}
        </Typography.Title>
        <Link href={`${base}/products/new`}>
          <Button type="primary" icon={<PlusOutlined />}>
            {p.create}
          </Button>
        </Link>
      </Flex>
      <Card variant="outlined" styles={{ body: { padding: 16 } }}>
        <Flex vertical gap={16}>
          <Flex gap={12} wrap>
            <Input.Search
              placeholder={p.searchPlaceholder}
              aria-label={p.searchPlaceholder}
              allowClear
              style={{ maxWidth: 360 }}
            />
            <Select
              aria-label="分類"
              style={{ width: 160 }}
              defaultValue=""
              options={[
                { value: "", label: p.allCategories },
                ...categories.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </Flex>
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Segmented
              value={status}
              onChange={(v) => setStatus(String(v))}
              options={(["ALL", "DRAFT", "PUBLISHED", "HIDDEN", "SOLD"] as const).map((s) => ({
                value: s,
                label: `${s === "ALL" ? p.all : adminCopy.status[s]} ${counts(s)}`,
              }))}
            />
          </div>
          <Table<AdminProductRow>
            rowKey="id"
            dataSource={shown}
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            scroll={{ x: 900 }}
            columns={[
              {
                title: p.columns.image,
                dataIndex: "image",
                width: 88,
                render: (src: string) => (
                  // eslint-disable-next-line @next/next/no-img-element -- mockup placeholder SVGs
                  <img
                    src={src}
                    alt=""
                    width={64}
                    height={48}
                    style={{
                      objectFit: "contain",
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: token.borderRadiusSM,
                    }}
                  />
                ),
              },
              {
                title: p.columns.name,
                key: "name",
                render: (_, r) => (
                  <Flex vertical>
                    <Link href={`${base}/products/${r.id}`}>
                      {r.brand} {r.model}
                    </Link>
                    <Typography.Text type="secondary">{r.nameZh || "—"}</Typography.Text>
                  </Flex>
                ),
              },
              { title: p.columns.category, dataIndex: "category", width: 120 },
              {
                title: p.columns.price,
                dataIndex: "priceTwd",
                width: 130,
                align: "right",
                render: (v?: number) =>
                  v ? (
                    formatTwd(v)
                  ) : (
                    <Typography.Text type="secondary">{p.askPrice}</Typography.Text>
                  ),
              },
              {
                title: p.columns.status,
                dataIndex: "status",
                width: 110,
                render: (s: AdminProductRow["status"]) => <ProductStatusTag status={s} />,
              },
              { title: p.columns.updatedAt, dataIndex: "updatedAt", width: 150 },
              {
                title: p.columns.actions,
                key: "actions",
                width: 150,
                fixed: "right",
                render: (_, r) => (
                  <Flex gap={4}>
                    <Link href={`${base}/products/${r.id}`}>
                      <Button size="small">{p.edit}</Button>
                    </Link>
                    <Dropdown
                      menu={{
                        items: [
                          r.status === "PUBLISHED"
                            ? { key: "hide", label: p.more.hide }
                            : { key: "publish", label: p.more.publish, disabled: !r.nameZh },
                          { key: "sold", label: p.more.sold, disabled: r.status === "SOLD" },
                          { key: "view", label: p.more.view },
                        ],
                      }}
                    >
                      <Button size="small" aria-label={`${r.brand} ${r.model} 更多操作`}>
                        更多 <DownOutlined aria-hidden />
                      </Button>
                    </Dropdown>
                  </Flex>
                ),
              },
            ]}
          />
        </Flex>
      </Card>
    </Flex>
  );
}

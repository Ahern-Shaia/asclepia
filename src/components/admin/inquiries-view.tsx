"use client";

import {
  Button,
  Card,
  Descriptions,
  Drawer,
  Flex,
  Input,
  Segmented,
  Select,
  Table,
  theme,
  Typography,
} from "antd";
import { useState } from "react";
import { adminCopy } from "@/copy/admin";
import { InquiryStatusTag } from "./status";

export type InquiryRow = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  org?: string;
  product: string;
  message: string;
  status: "NEW" | "CONTACTED" | "CLOSED_WON" | "CLOSED_LOST";
  note?: string;
};

const q = adminCopy.inquiries;

export function InquiriesView({ rows }: { rows: InquiryRow[] }) {
  const { token } = theme.useToken();
  const [open, setOpen] = useState<InquiryRow | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const shown = filter === "ALL" ? rows : rows.filter((r) => r.status === filter);
  return (
    <Flex vertical gap={16}>
      <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
        {q.title}
      </Typography.Title>
      <Card variant="outlined" styles={{ body: { padding: 16 } }}>
        <Flex vertical gap={16}>
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Segmented
              value={filter}
              onChange={(v) => setFilter(String(v))}
              options={(["ALL", "NEW", "CONTACTED", "CLOSED_WON", "CLOSED_LOST"] as const).map(
                (s) => ({
                  value: s,
                  label: `${s === "ALL" ? "全部" : q.status[s]} ${s === "ALL" ? rows.length : rows.filter((r) => r.status === s).length}`,
                }),
              )}
            />
          </div>
          <Table<InquiryRow>
            rowKey="id"
            dataSource={shown}
            pagination={{ pageSize: 20, hideOnSinglePage: true }}
            scroll={{ x: 720 }}
            onRow={(r) => ({ onClick: () => setOpen(r), style: { cursor: "pointer" } })}
            columns={[
              { title: q.columns.createdAt, dataIndex: "createdAt", width: 150 },
              {
                title: q.columns.name,
                key: "name",
                render: (_, r) => (
                  <Flex vertical>
                    <span>{r.name}</span>
                    {r.org && <Typography.Text type="secondary">{r.org}</Typography.Text>}
                  </Flex>
                ),
              },
              { title: q.columns.phone, dataIndex: "phone", width: 140 },
              { title: q.columns.product, dataIndex: "product" },
              {
                title: q.columns.status,
                dataIndex: "status",
                width: 110,
                render: (s: InquiryRow["status"]) => <InquiryStatusTag status={s} />,
              },
            ]}
          />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {q.retention}
          </Typography.Text>
        </Flex>
      </Card>
      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={q.detail}
        size="large"
        destroyOnHidden
      >
        {open && (
          <Flex vertical gap={16}>
            <Descriptions
              column={1}
              bordered
              size="small"
              items={[
                { key: "t", label: q.columns.createdAt, children: open.createdAt },
                { key: "n", label: q.columns.name, children: open.name },
                { key: "o", label: "單位", children: open.org ?? "—" },
                {
                  key: "p",
                  label: q.columns.phone,
                  children: <a href={`tel:${open.phone}`}>{open.phone}</a>,
                },
                {
                  key: "e",
                  label: "Email",
                  children: open.email ? <a href={`mailto:${open.email}`}>{open.email}</a> : "—",
                },
                { key: "pr", label: q.columns.product, children: open.product },
                { key: "m", label: q.message, children: open.message },
              ]}
            />
            <Flex vertical gap={8}>
              <Typography.Text strong>{q.columns.status}</Typography.Text>
              <Select
                defaultValue={open.status}
                aria-label={q.columns.status}
                options={(Object.keys(q.status) as (keyof typeof q.status)[]).map((k) => ({
                  value: k,
                  label: q.status[k],
                }))}
              />
            </Flex>
            <Flex vertical gap={8}>
              <Typography.Text strong>{q.note}</Typography.Text>
              <Input.TextArea
                rows={3}
                defaultValue={open.note}
                placeholder={q.notePlaceholder}
                aria-label={q.note}
              />
            </Flex>
            <Button type="primary">{q.save}</Button>
          </Flex>
        )}
      </Drawer>
    </Flex>
  );
}

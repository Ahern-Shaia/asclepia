"use client";

import { Card, Empty, Flex, Segmented, Table, theme, Typography } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminCopy } from "@/copy/admin";
import { INQUIRY_STATUSES, type InquiryStatusValue } from "@/modules/inquiry/admin-input";
import { LinkButton } from "./link-button";
import { InquiryStatusTag } from "./status";

export type InquiryListRow = {
  id: string;
  createdAt: string;
  name: string;
  org: string | null;
  phone: string;
  firstItem: string;
  itemCount: number;
  status: InquiryStatusValue;
};

const q = adminCopy.inquiries;

// Back-office inquiry list (inquiry.md B4). Status filter lives in the URL; paging is keyset.
export function InquiryList({
  rows,
  nextCursor,
  status,
  paged,
  counts,
  pageSize,
}: {
  rows: InquiryListRow[];
  nextCursor: string | null;
  status: InquiryStatusValue | "";
  paged: boolean;
  counts: Record<InquiryStatusValue, number>;
  pageSize: number;
}) {
  const { token } = theme.useToken();
  const router = useRouter();
  const pathname = usePathname();
  const href = (patch: { status?: string; cursor?: string }) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ status, ...patch })) if (v) next.set(k, v);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  const total = INQUIRY_STATUSES.reduce((n, s) => n + counts[s], 0);

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
        {q.title}
      </Typography.Title>
      <Card variant="outlined" styles={{ body: { padding: 16 } }}>
        <Flex vertical gap={16}>
          <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <Segmented
              aria-label={q.statusFilter}
              value={status || "ALL"}
              onChange={(v) => router.push(href({ status: v === "ALL" ? "" : String(v) }))}
              options={(["ALL", ...INQUIRY_STATUSES] as const).map((s) => ({
                value: s,
                label: s === "ALL" ? `${q.all} ${total}` : `${q.status[s]} ${counts[s]}`,
              }))}
            />
          </div>
          <Table<InquiryListRow>
            rowKey="id"
            dataSource={rows}
            pagination={false}
            scroll={{ x: 820 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={status ? q.noMatch : q.empty}
                >
                  {status && <LinkButton href={pathname}>{q.showAll}</LinkButton>}
                </Empty>
              ),
            }}
            columns={[
              { title: q.columns.createdAt, dataIndex: "createdAt", width: 150 },
              {
                title: q.columns.name,
                key: "name",
                render: (_, r) => (
                  <Flex vertical>
                    <Link href={`/admin/inquiries/${r.id}`}>{r.name}</Link>
                    {r.org && <Typography.Text type="secondary">{r.org}</Typography.Text>}
                  </Flex>
                ),
              },
              {
                title: q.columns.phone,
                dataIndex: "phone",
                width: 150,
                render: (v: string) => <a href={`tel:${v}`}>{v}</a>,
              },
              {
                title: q.columns.product,
                key: "product",
                render: (_, r) => (
                  <Flex vertical>
                    <span>{r.firstItem}</span>
                    {r.itemCount > 1 && (
                      <Typography.Text type="secondary">{q.moreItems(r.itemCount)}</Typography.Text>
                    )}
                  </Flex>
                ),
              },
              {
                title: q.columns.status,
                dataIndex: "status",
                width: 110,
                render: (s: InquiryStatusValue) => <InquiryStatusTag status={s} />,
              },
              {
                title: adminCopy.products.columns.actions,
                key: "actions",
                width: 90,
                render: (_, r) => (
                  <LinkButton
                    href={`/admin/inquiries/${r.id}`}
                    size="small"
                    aria-label={q.openLabel(r.name, r.createdAt)}
                  >
                    {q.open}
                  </LinkButton>
                ),
              },
            ]}
          />
          <Flex justify="space-between" align="center" gap={12} wrap>
            <Typography.Text type="secondary">{q.pageNote(pageSize)}</Typography.Text>
            <Flex gap={8}>
              {paged && <LinkButton href={href({})}>{adminCopy.products.first}</LinkButton>}
              {nextCursor && (
                <LinkButton href={href({ cursor: nextCursor })}>
                  {adminCopy.products.next}
                </LinkButton>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

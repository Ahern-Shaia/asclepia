"use client";

import { ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  App,
  Button,
  Card,
  Descriptions,
  Empty,
  Flex,
  Input,
  Modal,
  Select,
  Tag,
  theme,
  Typography,
} from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatTwd } from "@/components/catalog/format";
import { adminCopy } from "@/copy/admin";
import { deleteInquiryAction, updateInquiryAction } from "@/modules/inquiry/actions";
import { INQUIRY_STATUSES, type InquiryStatusValue } from "@/modules/inquiry/admin-input";
import { call, type Failure, FailureAlert } from "./action-result";
import type { ProductStatus } from "./catalog-data";
import styles from "./admin.module.css";
import { LinkButton } from "./link-button";
import { InquiryStatusTag, ProductStatusTag } from "./status";

export type InquiryDetailItem = {
  productId: string;
  titleThen: string;
  priceThen: number | null;
  titleNow: string;
  priceNow: number | null;
  statusNow: ProductStatus;
};

export type InquiryDetailData = {
  id: string;
  createdAt: string;
  keepUntil: string;
  status: InquiryStatusValue;
  name: string;
  phone: string;
  email: string | null;
  org: string | null;
  message: string | null;
  consentText: string;
  note: string | null;
  items: InquiryDetailItem[];
};

const q = adminCopy.inquiries;
const price = (v: number | null) => (v === null ? q.askPrice : formatTwd(v));

export function InquiryMissing() {
  return (
    <Empty description={q.notFound}>
      <LinkButton href="/admin/inquiries">{q.back}</LinkButton>
    </Empty>
  );
}

// One inquiry (inquiry.md §6 「後台詢價詳情」): who to call, what they asked about as they saw it,
// what those products look like now, and the handling status + internal note.
export function InquiryDetail({ inquiry: d }: { inquiry: InquiryDetailData }) {
  const { token } = theme.useToken();
  const router = useRouter();
  const { message } = App.useApp();
  const [modal, modalHolder] = Modal.useModal();
  const [status, setStatus] = useState(d.status);
  const [note, setNote] = useState(d.note ?? "");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const dirty = status !== d.status || note.trim() !== (d.note ?? "");

  const save = async () => {
    setBusy(true);
    const r = await call(updateInquiryAction, {
      id: d.id,
      status,
      note,
      expected: { status: d.status, note: d.note },
    });
    setBusy(false);
    if (!r.ok) return setFailure(r);
    setFailure(null);
    message.success(q.saved);
    router.refresh();
  };

  const onDelete = () =>
    modal.confirm({
      title: q.deleteTitle,
      content: (
        <Flex vertical gap={4}>
          {q.deleteBody.map((line) => (
            <Typography.Text key={line}>{line}</Typography.Text>
          ))}
        </Flex>
      ),
      okText: q.deleteOk,
      okButtonProps: { danger: true },
      cancelText: q.cancel,
      onOk: async () => {
        const r = await call(deleteInquiryAction, { id: d.id });
        if (!r.ok) return setFailure(r);
        message.success(q.deleted);
        router.replace("/admin/inquiries");
      },
    });

  return (
    <Flex vertical gap={16}>
      {modalHolder}
      <div>
        <LinkButton href="/admin/inquiries" type="link" icon={<ArrowLeftOutlined />}>
          {q.back}
        </LinkButton>
      </div>
      <Flex align="center" gap={12} wrap>
        <Typography.Title level={1} style={{ fontSize: token.fontSizeHeading3 }}>
          {q.detail}
        </Typography.Title>
        <InquiryStatusTag status={d.status} />
        <Typography.Text type="secondary">{d.createdAt}</Typography.Text>
      </Flex>
      {failure && <FailureAlert failure={failure} />}

      <Card title={q.contact} variant="outlined">
        <Descriptions
          column={1}
          size="small"
          items={[
            { key: "n", label: q.columns.name, children: d.name },
            { key: "o", label: q.org, children: d.org ?? "—" },
            {
              key: "p",
              label: q.columns.phone,
              children: <a href={`tel:${d.phone}`}>{d.phone}</a>,
            },
            {
              key: "e",
              label: q.email,
              children: d.email ? <a href={`mailto:${d.email}`}>{d.email}</a> : "—",
            },
            {
              key: "m",
              label: q.message,
              children: d.message ? (
                <Typography.Paragraph style={{ whiteSpace: "pre-wrap" }}>
                  {d.message}
                </Typography.Paragraph>
              ) : (
                <Typography.Text type="secondary">{q.noMessage}</Typography.Text>
              ),
            },
            {
              key: "c",
              label: q.consent,
              children: <Typography.Text type="secondary">{d.consentText}</Typography.Text>,
            },
            { key: "k", label: q.keepUntil, children: d.keepUntil },
          ]}
        />
      </Card>

      <Card title={`${q.items}（${d.items.length}）`} variant="outlined">
        <ul className={styles.itemRows}>
          {d.items.map((r) => {
            const changed = r.titleNow !== r.titleThen || r.priceNow !== r.priceThen;
            return (
              <li key={r.productId}>
                <Flex vertical gap={2}>
                  <Typography.Text type="secondary">{q.itemColumns.then}</Typography.Text>
                  <span>{r.titleThen}</span>
                  <Typography.Text type="secondary">{price(r.priceThen)}</Typography.Text>
                </Flex>
                <Flex vertical gap={4}>
                  <Flex gap={8} wrap align="center">
                    <Typography.Text type="secondary">{q.itemColumns.now}</Typography.Text>
                    <ProductStatusTag status={r.statusNow} />
                    {changed && (
                      <Tag color="warning" title={q.changedHelp}>
                        {q.changed}
                      </Tag>
                    )}
                  </Flex>
                  {changed && <span>{r.titleNow}</span>}
                  <Typography.Text type="secondary">{price(r.priceNow)}</Typography.Text>
                </Flex>
                <LinkButton
                  href={`/admin/products/${r.productId}`}
                  size="small"
                  aria-label={`${q.openProduct}「${r.titleNow}」`}
                >
                  {q.openProduct}
                </LinkButton>
              </li>
            );
          })}
        </ul>
        {d.items.some((r) => r.titleNow !== r.titleThen || r.priceNow !== r.priceThen) && (
          <Typography.Text type="secondary">{q.changedHelp}</Typography.Text>
        )}
      </Card>

      <Card title={q.handling} variant="outlined">
        <Flex vertical gap={16} style={{ maxWidth: 560 }}>
          <Flex vertical gap={8}>
            <Typography.Text strong id="inq-status">
              {q.columns.status}
            </Typography.Text>
            <Select
              aria-labelledby="inq-status"
              value={status}
              onChange={setStatus}
              style={{ maxWidth: 220 }}
              options={INQUIRY_STATUSES.map((s) => ({ value: s, label: q.status[s] }))}
            />
          </Flex>
          <Flex vertical gap={8}>
            <Typography.Text strong id="inq-note">
              {q.note}
            </Typography.Text>
            <Input.TextArea
              aria-labelledby="inq-note"
              rows={4}
              maxLength={2000}
              showCount
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={q.notePlaceholder}
            />
          </Flex>
          <Flex gap={12} align="center" wrap>
            <Button type="primary" onClick={save} loading={busy} disabled={!dirty}>
              {q.save}
            </Button>
            {dirty && <Typography.Text type="secondary">{q.unsaved}</Typography.Text>}
          </Flex>
        </Flex>
      </Card>

      <Card variant="outlined">
        <Flex justify="space-between" align="center" gap={12} wrap>
          <Typography.Text type="secondary">{q.deleteHelp}</Typography.Text>
          <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
            {q.delete}
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}

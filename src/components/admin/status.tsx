"use client";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  StopOutlined,
  TrophyOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Tag } from "antd";
import type { ReactNode } from "react";
import { adminCopy } from "@/copy/admin";

// Status is never colour-only (§A3): every tag carries an icon and a word.
const productStatus: Record<string, { color: string; icon: ReactNode }> = {
  DRAFT: { color: "default", icon: <EditOutlined /> },
  PUBLISHED: { color: "success", icon: <CheckCircleOutlined /> },
  HIDDEN: { color: "warning", icon: <EyeInvisibleOutlined /> },
  SOLD: { color: "processing", icon: <TrophyOutlined /> },
};

export function ProductStatusTag({ status }: { status: keyof typeof adminCopy.status }) {
  const s = productStatus[status];
  return (
    <Tag color={s.color} icon={s.icon}>
      {adminCopy.status[status]}
    </Tag>
  );
}

const inquiryStatus: Record<string, { color: string; icon: ReactNode }> = {
  NEW: { color: "error", icon: <ExclamationCircleOutlined /> },
  CONTACTED: { color: "processing", icon: <PhoneOutlined /> },
  CLOSED_WON: { color: "success", icon: <CheckCircleOutlined /> },
  CLOSED_LOST: { color: "default", icon: <StopOutlined /> },
};

export function InquiryStatusTag({ status }: { status: keyof typeof adminCopy.inquiries.status }) {
  const s = inquiryStatus[status];
  return (
    <Tag color={s.color} icon={s.icon ?? <ClockCircleOutlined />}>
      {adminCopy.inquiries.status[status]}
    </Tag>
  );
}

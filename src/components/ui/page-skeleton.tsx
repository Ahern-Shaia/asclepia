"use client";

import { Flex, Skeleton } from "antd";
import ui from "./ui.module.css";

// Route-level loading state (§A6): mirrors a title + two-column body so content doesn't jump in.
export function PageSkeleton() {
  return (
    <Flex vertical gap={24} className={ui.page} aria-busy="true">
      <Skeleton.Input active size="small" style={{ width: 240 }} />
      <Flex gap={32} wrap>
        <Skeleton.Image active style={{ width: 480, height: 360, maxWidth: "100%" }} />
        <Flex vertical gap={16} style={{ flex: 1, minWidth: 260 }}>
          <Skeleton active title paragraph={{ rows: 6 }} />
        </Flex>
      </Flex>
    </Flex>
  );
}

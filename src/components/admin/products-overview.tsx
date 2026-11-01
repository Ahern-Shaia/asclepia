"use client";

import { Flex, Typography } from "antd";
import { adminCopy } from "@/copy/admin";

export function ProductsOverview({ count }: { count: number }) {
  return (
    <Flex vertical gap={12}>
      <Typography.Title level={1} style={{ fontSize: 24 }}>
        {adminCopy.products.title}
      </Typography.Title>
      <Typography.Text>{adminCopy.overview.productCount(count)}</Typography.Text>
    </Flex>
  );
}

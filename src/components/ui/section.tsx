"use client";

import { Flex, Typography } from "antd";
import type { CSSProperties, ReactNode } from "react";

// One heading + content block. Heading margins are zero (theme Typography tokens); spacing comes
// from the gap here, so pages never reset margins inline (R13).
export function Section({
  id,
  title,
  level = 2,
  extra,
  style,
  children,
}: {
  id: string;
  title: ReactNode;
  level?: 1 | 2 | 3;
  extra?: ReactNode;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} style={style}>
      <Flex vertical gap={16}>
        <Flex justify="space-between" align="baseline" gap={16} wrap>
          <Typography.Title level={level} id={id}>
            {title}
          </Typography.Title>
          {extra}
        </Flex>
        {children}
      </Flex>
    </section>
  );
}

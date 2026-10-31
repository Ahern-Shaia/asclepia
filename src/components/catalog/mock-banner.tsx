"use client";

import { ExperimentOutlined } from "@ant-design/icons";
import { Flex, theme, Typography } from "antd";
import { adminCopy } from "@/copy/admin";

export function MockBanner() {
  const { token } = theme.useToken();
  return (
    <Flex
      align="center"
      justify="center"
      gap={6}
      role="note"
      style={{
        background: token.colorWarningBg,
        borderBottom: `1px solid ${token.colorWarningBorder}`,
        padding: "4px 16px",
      }}
    >
      <ExperimentOutlined aria-hidden style={{ color: token.colorWarning }} />
      <Typography.Text style={{ fontSize: token.fontSizeSM, color: token.colorWarning }}>
        {adminCopy.mockBanner}
      </Typography.Text>
    </Flex>
  );
}

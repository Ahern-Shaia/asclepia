"use client";

import { Flex, Layout, theme, Typography } from "antd";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteCopy } from "@/copy/site";
import styles from "./site-shell.module.css";

// Layout sizing goes through props/style, not CSS-module classes on antd components:
// antd's own single-class rules (e.g. .ant-layout { min-height: 0 }) are injected later and win.
export function SiteShell({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header style={{ borderBottom: `1px solid ${token.colorBorder}` }}>
        <div className={styles.inner}>
          <Flex align="center" gap={8} style={{ height: "100%" }}>
            <Link
              href="/"
              className={styles.brand}
              style={{ color: token.colorPrimary }}
              data-testid="brand"
            >
              {siteCopy.name}
            </Link>
            <Typography.Text type="secondary">{siteCopy.tagline}</Typography.Text>
          </Flex>
        </div>
      </Layout.Header>
      <Layout.Content className={styles.content}>
        <div className={styles.inner}>{children}</div>
      </Layout.Content>
      <Layout.Footer>
        <div className={styles.inner}>
          <Typography.Text type="secondary">{siteCopy.copyright}</Typography.Text>
        </div>
      </Layout.Footer>
    </Layout>
  );
}

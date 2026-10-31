"use client";

import { theme } from "antd";
import type { ReactNode } from "react";
import { MockBanner } from "./mock-banner";
import { type CompanyInfo, CatalogFooter } from "./site-footer";
import { CatalogHeader } from "./site-header";

export function CatalogFrame({
  base,
  company,
  mock,
  children,
}: {
  base: string;
  company: CompanyInfo;
  mock?: boolean;
  children: ReactNode;
}) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: token.colorBgContainer,
      }}
    >
      {mock && <MockBanner />}
      <CatalogHeader base={base} />
      <main style={{ flex: 1 }}>{children}</main>
      <CatalogFooter company={company} />
    </div>
  );
}

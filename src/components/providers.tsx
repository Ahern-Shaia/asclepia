"use client";

import { ConfigProvider } from "antd";
import zhTW from "antd/locale/zh_TW";
import type { ReactNode } from "react";
import { theme } from "@/theme/tokens";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={theme} locale={zhTW}>
      {children}
    </ConfigProvider>
  );
}

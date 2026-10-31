"use client";

import { App, ConfigProvider } from "antd";
import zhTW from "antd/locale/zh_TW";
import type { ReactNode } from "react";
import { theme } from "@/theme/tokens";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={theme} locale={zhTW}>
      {/* App applies the token font, colour and line-height to plain HTML (ul, p) too */}
      <App>{children}</App>
    </ConfigProvider>
  );
}

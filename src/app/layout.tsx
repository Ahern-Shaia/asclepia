import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { siteCopy } from "@/copy/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${siteCopy.name}｜${siteCopy.tagline}`,
  description: siteCopy.description,
};

// AntdRegistry calls @ant-design/cssinjs createCache(), which uses Math.random(). Under
// cacheComponents that is rejected during prerender, so the antd tree renders at request time
// inside this boundary (Next docs: getting-started/caching "Random values and timestamps").
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant-TW">
      <body>
        <Suspense>
          <AntdRegistry>
            <Providers>{children}</Providers>
          </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}

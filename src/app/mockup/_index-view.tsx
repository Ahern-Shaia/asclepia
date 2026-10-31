"use client";

import { Card, Flex, Typography } from "antd";
import Link from "next/link";
import { MockBanner } from "@/components/catalog/mock-banner";
import ui from "@/components/ui/ui.module.css";

const groups = [
  {
    title: "前台",
    items: [
      ["首頁", "/mockup/site"],
      ["商品列表", "/mockup/site/products"],
      ["商品列表：分類＋品牌篩選", "/mockup/site/products?cat=ultrasound"],
      ["商品列表：搜尋無結果（空狀態）", "/mockup/site/products?q=MRI"],
      ["商品列表：載入中（skeleton）", "/mockup/site/products?state=loading"],
      ["商品頁（含銘牌、規格表；按「詢價」開表單）", "/mockup/site/products/p1"],
      ["商品頁：沒有價格（歡迎詢價）", "/mockup/site/products/p2"],
      ["商品頁：已售出", "/mockup/site/products/p4"],
    ],
  },
  {
    title: "後台",
    items: [
      ["登入", "/mockup/admin/login"],
      ["登入：帳號不在白名單", "/mockup/admin/login?denied=1"],
      ["商品管理", "/mockup/admin/products"],
      ["新增商品（空白表單，上架鈕鎖住）", "/mockup/admin/products/new"],
      ["編輯商品（已填好；在產品訊息打「改善」看療效字詞警告）", "/mockup/admin/products/p1"],
      ["編輯草稿（缺中文品名，上架鈕鎖住）", "/mockup/admin/products/p7"],
      ["詢價紀錄（點一列開明細）", "/mockup/admin/inquiries"],
    ],
  },
] as const;

export function MockupIndex() {
  return (
    <Flex vertical style={{ minHeight: "100vh" }}>
      <MockBanner />
      <Flex vertical gap={24} className={`${ui.page} ${ui.narrow}`}>
        <Typography.Title level={1}>Asclepia 視覺設計 mockup</Typography.Title>
        <Typography.Paragraph type="secondary">
          以 Ant Design 實際渲染、範例資料。視覺依據見 docs/frontend-design-principles.md
          §B0（spec-catalog）。
        </Typography.Paragraph>
        {groups.map((g) => (
          <Card key={g.title} title={g.title} variant="outlined">
            <Flex vertical gap={12} component="ul" style={{ listStyle: "none", padding: 0 }}>
              {(g.items as unknown as [string, string][]).map(([label, href]) => (
                <li key={href}>
                  <Flex justify="space-between" gap={12} wrap>
                    <Link href={href}>{label}</Link>
                    <Typography.Text type="secondary" code>
                      {href}
                    </Typography.Text>
                  </Flex>
                </li>
              ))}
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}

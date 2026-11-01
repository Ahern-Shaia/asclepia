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
      ["首頁 v2（美工加強版，待 review）", "/mockup/site-v2"],
      ["首頁 v3「實機型錄」（參考站整合，待確認）", "/mockup/site-v3"],
      ["首頁 v4「實機型錄＋美工插畫」（待確認）", "/mockup/site-v4"],
      ["首頁 v5「實機型錄・照片版」（依美工規範，待確認）", "/mockup/site-v5"],
      ["首頁 v5.1「實機型錄」✅ 定案基準稿（2026-11-01）", "/mockup/site-v5-1"],
      ["v5.1 商品列表（篩選欄依商品欄位設定）", "/mockup/site-v5-1/products"],
      ["v5.1 商品列表：搜尋無結果", "/mockup/site-v5-1/products?q=MRI"],
      ["v5.1 商品頁（詢價這件＋加入詢價清單）", "/mockup/site-v5-1/products/p1"],
      ["v5.1 商品頁：已售出", "/mockup/site-v5-1/products/p4"],
      ["v5.1 詢價清單（依你的瀏覽器清單）", "/mockup/site-v5-1/inquiry"],
      ["v5.1 詢價清單：空的", "/mockup/site-v5-1/inquiry?demo=empty"],
      ["v5.1 詢價清單：有一件已售出（擋下送出）", "/mockup/site-v5-1/inquiry?demo=sold"],
      ["v5.1 詢價清單：送出成功", "/mockup/site-v5-1/inquiry?demo=success"],
      ["首頁風格實驗室（20 款，待選）", "/mockup/style-lab"],
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
      ["站台設定（店家資料、主題、首頁區塊、文案、功能開關）", "/mockup/admin/settings"],
      ["商品欄位（屬性庫＋各分類設定）", "/mockup/admin/attributes"],
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
          §B0（實機型錄，基準稿是首頁 v5.1）。
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

// STYLE LAB — shared content for the 20 home-page style proposals (docs/mockups/README.md).
// Every variant renders exactly this content so the comparison is about style, not copy.
// Claims are deliberately limited: no "已檢測"/testing claims, no medical efficacy words.
import { categories, company, publicProducts } from "../_data";
import { toCard } from "../_adapters";

export const SITE = "/mockup/site";

export const lab = {
  brand: "Asclepia",
  tagline: "中古設備買賣",
  eyebrow: "自有庫存 · 可預約看機",
  headline: "中古院所與檢驗設備，看過實機再決定。",
  headlineShort: ["看過實機，", "再決定。"],
  lead: "院所與檢驗設備的中古型錄。每件附照片與規格表，詢價後安排看機，確認了再成交。",
  searchPlaceholder: "搜尋品牌、型號或品名",
  searchButton: "搜尋",
  nav: [
    { href: `${SITE}/products`, label: "商品型錄" },
    { href: "#services", label: "服務項目" },
    { href: "#contact", label: "聯絡我們" },
  ],
  promises: [
    { id: "photos", title: "照片與規格表", body: "每件商品附多張照片與逐項規格" },
    { id: "visit", title: "可預約看機", body: "約時間到倉庫看實機再決定" },
    { id: "install", title: "到場拆裝運送", body: "大型設備派人到場安裝，運費另計" },
  ],
  categoriesTitle: "依分類找設備",
  categories: categories.map((c) => ({
    ...c,
    href: `${SITE}/products?cat=${c.id}`,
    image: `/mockup/${c.id}-1.svg`,
  })),
  latestTitle: "最新上架",
  viewAll: "看全部商品",
  latest: publicProducts.slice(0, 4).map((p) => ({
    ...toCard(p),
    warranty: p.warranty,
    href: `${SITE}/products/${p.id}`,
  })),
  askPrice: "歡迎詢價",
  sold: "已售出",
  stepsTitle: "怎麼買",
  steps: [
    { title: "詢價", body: "在商品頁留下電話，或直接來電。" },
    { title: "到場看機", body: "約時間到倉庫看實機，確認外觀與功能。" },
    { title: "成交與安裝", body: "確認後付款。大型設備派人到場拆裝，運費另計。" },
  ],
  servicesTitle: "也可以找我們",
  services: [
    { id: "buy", title: "收購", body: "汰換下來的設備，拍照給我們估價。" },
    { id: "repair", title: "維修", body: "非本站購買的設備也可以送修。" },
    { id: "rent", title: "租賃", body: "短期專案或等新機期間，先租一台。" },
  ],
  call: `來電 ${company.phone}`,
  company,
  copyright: "© Asclepia",
} as const;

export const twd = (n: number) => `NT$ ${n.toLocaleString("zh-TW")}`;

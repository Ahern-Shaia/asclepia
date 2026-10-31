// Home page v2 copy (CLAUDE.md R12). Promises here must match catalogCopy.detail.termsBody.
export const homeCopy = {
  hero: {
    eyebrow: "自有庫存 · 可到場看機",
    heading: ["測過、整理好，", "再交到你手上。"],
    lead: "院所與檢驗設備的中古型錄。每件附照片與規格表，詢價後安排看機，確認了再成交。",
    quick: "常找的分類",
    tag: { title: "可看機", sub: "歡迎預約" },
    callouts: [
      { id: "test", title: "出貨前功能檢測", body: "開機、影像、配件逐項測過" },
      { id: "warranty", title: "保固期內免費維修", body: "非人為故障，不另收費" },
      { id: "install", title: "到場拆裝與運送", body: "大型設備派人安裝" },
    ],
  },
  categories: { title: "依分類找設備", unit: "件" },
  latest: { title: "最新上架", viewAll: "看全部商品" },
  card: { warranty: (w: string) => `保固 ${w}`, year: (y: number) => `${y} 年` },
  steps: {
    title: "怎麼買",
    items: [
      { title: "詢價", body: "在商品頁留下電話，或直接來電。一個工作天內回覆。" },
      { title: "到場看機", body: "約時間到倉庫看實機，開機確認外觀與功能。" },
      { title: "成交與安裝", body: "確認後付款。大型設備派人到場拆裝，運費另計。" },
    ],
  },
  services: {
    title: "也可以找我們",
    items: [
      { id: "buy", title: "收購", body: "汰換下來的設備，拍照給我們估價。" },
      { id: "repair", title: "維修", body: "非本站購買的設備也可以送修。" },
      { id: "rent", title: "租賃", body: "短期專案或等新機期間，先租一台。" },
    ],
    call: (phone: string) => `來電 ${phone}`,
  },
  header: { call: "來電" },
  footer: { phone: "電話", email: "Email", address: "地址" },
} as const;

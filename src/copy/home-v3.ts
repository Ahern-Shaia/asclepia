// Home v3 copy (R12) — the "實機型錄" style synthesised from the reference survey
// (docs/research/2026-10-31-visual-synthesis.md). No testing claims, no efficacy words.
export const homeV3Copy = {
  util: {
    hours: (h: string) => `營業時間 ${h}`,
    visit: "看機請先來電預約",
  },
  header: {
    searchPlaceholder: "搜尋品牌、型號或品名",
    allCategories: "全部分類",
    search: "搜尋",
    inquiryList: "詢價清單",
    book: "預約看機",
  },
  hero: {
    heading: "中古院所與檢驗設備，看過實機再決定。",
    points: ["每件附照片與規格表", "可預約到倉庫看實機", "大型設備到場拆裝運送"],
    finder: {
      title: "快速找設備",
      category: "分類",
      brand: "品牌",
      year: "年份",
      any: "不限",
      yearOptions: ["2020 年以後", "2015 年以後", "2010 年以後"],
      submit: (n: number) => `查看 ${n} 件設備`,
    },
  },
  categories: { title: "設備分類", unit: "件", all: "全部分類" },
  latest: {
    title: "最新上架",
    viewAll: "看全部商品",
    newTag: "新到",
    sold: "已售出",
    askPrice: "歡迎詢價",
    add: "加入詢價清單",
    added: "已加入",
    warranty: (w: string) => `保固 ${w}`,
    year: (y: number) => `${y} 年`,
  },
  brands: { title: "依品牌找" },
  buy: {
    title: "怎麼買",
    steps: [
      { title: "詢價", body: "在商品頁加入詢價清單，一次詢問多台；或直接來電。" },
      { title: "預約看機", body: "約時間到倉庫看實機，開機確認外觀與功能。" },
      { title: "成交與安裝", body: "確認後付款。大型設備派人到場拆裝，運費另計。" },
    ],
  },
  visit: {
    title: "看機地點",
    address: "地址",
    hours: "營業時間",
    note: "看機請先來電預約。",
    call: "來電預約",
  },
  services: {
    title: "也可以找我們",
    items: [
      { id: "buy", title: "收購", body: "汰換下來的設備，拍照給我們估價。" },
      { id: "repair", title: "維修", body: "非本站購買的設備也可以送修。" },
      { id: "rent", title: "租賃", body: "短期專案或等新機期間，先租一台。" },
    ],
  },
  mobileBar: { call: "來電", inquiry: "詢價清單" },
} as const;

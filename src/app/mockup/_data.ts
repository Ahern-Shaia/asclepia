// MOCKUP DATA — sample content for visual review only (docs/mockups/README.md).
// Licence numbers are deliberately fake (000xxx) and optional: only items that are registered
// medical devices carry one. Every page carries the mockup banner.

export type ProductStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "SOLD";

export type MockProduct = {
  id: string;
  categoryId: string;
  status: ProductStatus;
  brand: string;
  model: string;
  nameEn?: string;
  nameZh: string;
  licenseNo?: string;
  priceTwd?: number;
  year?: number;
  condition?: string;
  warranty?: string;
  images: string[];
  highlights: string[];
  specs: { label: string; value: string }[];
  features: string[];
  updatedAt: string;
};

export type MockCategory = { id: string; name: string; count: number };

export const categories: MockCategory[] = [
  { id: "ultrasound", name: "超音波", count: 12 },
  { id: "monitor", name: "病人監視器", count: 9 },
  { id: "analyzer", name: "檢驗分析儀", count: 7 },
  { id: "centrifuge", name: "離心機", count: 5 },
  { id: "microscope", name: "顯微鏡", count: 4 },
  { id: "dental", name: "牙科設備", count: 6 },
];

export const brands = ["GE", "Philips", "Mindray", "Sysmex", "Eppendorf", "Olympus", "Sirona"];

const img = (kind: string) => [1, 2, 3].map((i) => `/mockup/${kind}-${i}.svg`);

export const products: MockProduct[] = [
  {
    id: "p1",
    categoryId: "ultrasound",
    status: "PUBLISHED",
    brand: "GE",
    model: "LOGIQ e",
    nameEn: "Portable Ultrasound System",
    nameZh: "攜帶式超音波掃描儀",
    licenseNo: "衛部醫器輸字第000101號",
    priceTwd: 380000,
    year: 2019,
    condition: "良好，外觀輕微使用痕跡",
    warranty: "三個月",
    images: img("ultrasound"),
    highlights: [
      "主機含兩支探頭：線性 12L-RS、凸面 4C-RS",
      "原廠軟體 R9 版，開機時數約 2,100 小時",
    ],
    specs: [
      { label: "顯示器", value: "15 吋 LCD" },
      { label: "探頭接口", value: "1 個主動接口" },
      { label: "影像模式", value: "B / M / Color / PW Doppler" },
      { label: "儲存", value: "內建 160 GB，USB 匯出" },
      { label: "電源", value: "AC 100–240 V，內建電池約 1 小時" },
      { label: "重量", value: "約 4.6 kg（主機）" },
    ],
    features: ["Compact laptop form factor", "DICOM 3.0 connectivity", "Auto optimisation (AO)"],
    updatedAt: "2026-10-28 14:20",
  },
  {
    id: "p2",
    categoryId: "monitor",
    status: "PUBLISHED",
    brand: "Philips",
    model: "IntelliVue MX450",
    nameEn: "Patient Monitor",
    nameZh: "病人生理監視器",
    licenseNo: "衛部醫器輸字第000214號",
    year: 2020,
    condition: "良好",
    warranty: "三個月",
    images: img("monitor"),
    highlights: ["含 ECG、SpO₂、NIBP 模組", "觸控螢幕無壞點", "附原廠電源線與 ECG 導線"],
    specs: [
      { label: "螢幕", value: "12 吋觸控" },
      { label: "參數", value: "ECG / SpO₂ / NIBP / Temp" },
      { label: "電池", value: "鋰電池，約 4 小時" },
    ],
    features: ["Integrated measurement module", "Network-ready"],
    updatedAt: "2026-10-27 09:05",
  },
  {
    id: "p3",
    categoryId: "analyzer",
    status: "PUBLISHED",
    brand: "Mindray",
    model: "BC-5150",
    nameEn: "Auto Hematology Analyzer",
    nameZh: "全自動血液分析儀（五分類）",
    licenseNo: "衛部醫器輸字第000377號",
    priceTwd: 260000,
    year: 2018,
    condition: "良好，已更換管路",
    warranty: "三個月",
    images: img("analyzer"),
    highlights: ["五分類白血球分析", "每小時約 60 個樣本", "含試劑架與條碼掃描器"],
    specs: [
      { label: "通量", value: "約 60 樣本／小時" },
      { label: "樣本量", value: "全血約 20 μL" },
      { label: "儲存", value: "最多 40,000 筆結果" },
    ],
    features: ["5-part differential", "LIS connectivity"],
    updatedAt: "2026-10-25 16:40",
  },
  {
    id: "p4",
    categoryId: "centrifuge",
    status: "SOLD",
    brand: "Eppendorf",
    model: "5424",
    nameEn: "Microcentrifuge",
    nameZh: "微量離心機",
    priceTwd: 45000,
    year: 2021,
    condition: "近新",
    warranty: "三個月",
    images: img("centrifuge"),
    highlights: ["24 孔轉子", "最高 21,130 × g"],
    specs: [
      { label: "最高轉速", value: "15,060 rpm" },
      { label: "容量", value: "24 × 1.5/2.0 mL" },
    ],
    features: ["Quiet operation"],
    updatedAt: "2026-10-20 11:12",
  },
  {
    id: "p5",
    categoryId: "microscope",
    status: "PUBLISHED",
    brand: "Olympus",
    model: "CX23",
    nameZh: "雙眼生物顯微鏡",
    priceTwd: 32000,
    year: 2022,
    condition: "良好",
    images: img("microscope"),
    highlights: ["4× / 10× / 40× / 100× 物鏡", "LED 照明"],
    specs: [{ label: "目鏡", value: "10×，視野 20 mm" }],
    features: [],
    updatedAt: "2026-10-18 10:30",
  },
  {
    id: "p6",
    categoryId: "dental",
    status: "PUBLISHED",
    brand: "Sirona",
    model: "INTEGO",
    nameEn: "Dental Treatment Center",
    nameZh: "牙科治療台",
    licenseNo: "衛部醫器輸字第000613號",
    year: 2017,
    condition: "良好，椅墊已換新",
    warranty: "三個月",
    images: img("dental"),
    highlights: ["含 LED 手術燈", "醫師器械台 5 孔位", "需專人到場拆裝，運費另計"],
    specs: [{ label: "座椅", value: "電動升降，記憶位置 4 組" }],
    features: [],
    updatedAt: "2026-10-15 15:00",
  },
  {
    id: "p7",
    categoryId: "ultrasound",
    status: "DRAFT",
    brand: "Mindray",
    model: "DP-30",
    nameZh: "",
    images: img("ultrasound").slice(0, 1),
    highlights: [],
    specs: [],
    features: [],
    updatedAt: "2026-10-30 18:02",
  },
  {
    id: "p8",
    categoryId: "monitor",
    status: "HIDDEN",
    brand: "Mindray",
    model: "iPM 12",
    nameEn: "Patient Monitor",
    nameZh: "多參數病人監視器",
    licenseNo: "衛部醫器輸字第000729號",
    priceTwd: 58000,
    year: 2016,
    condition: "可用，外殼有刮痕",
    images: img("monitor"),
    highlights: ["含 ECG、SpO₂、NIBP"],
    specs: [],
    features: [],
    updatedAt: "2026-10-12 13:45",
  },
];

export const publicProducts = products.filter(
  (p) => p.status === "PUBLISHED" || p.status === "SOLD",
);

export type InquiryStatus = "NEW" | "CONTACTED" | "CLOSED_WON" | "CLOSED_LOST";
export type MockInquiry = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email?: string;
  org?: string;
  productId: string;
  message: string;
  status: InquiryStatus;
  note?: string;
};

export const inquiries: MockInquiry[] = [
  {
    id: "q1",
    createdAt: "2026-10-31 10:12",
    name: "陳小姐",
    phone: "0912-000-111",
    org: "範例診所",
    productId: "p1",
    message: "請問探頭是否還在保固？可以週末看機嗎？",
    status: "NEW",
  },
  {
    id: "q2",
    createdAt: "2026-10-30 16:45",
    name: "林先生",
    phone: "02-0000-2222",
    email: "lin@example.com",
    org: "範例設備有限公司",
    productId: "p3",
    message: "想詢問含稅價與運送安裝費用。",
    status: "CONTACTED",
    note: "10/30 已回電，約 11/4 看機",
  },
  {
    id: "q3",
    createdAt: "2026-10-28 09:30",
    name: "王先生",
    phone: "0988-000-333",
    productId: "p2",
    message: "有兩台嗎？",
    status: "CLOSED_LOST",
    note: "需要兩台，庫存只有一台",
  },
  {
    id: "q4",
    createdAt: "2026-10-22 14:05",
    name: "黃小姐",
    phone: "0933-000-444",
    org: "範例檢驗所",
    productId: "p4",
    message: "可以開發票嗎？",
    status: "CLOSED_WON",
    note: "10/24 成交",
  },
];

export const company = {
  name: "（範例）Asclepia 有限公司",
  phone: "02-0000-0000",
  email: "service@example.com",
  address: "台北市範例區範例路 1 號",
  hours: "週一至週五 09:00–18:00",
};

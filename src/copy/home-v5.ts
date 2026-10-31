// Home v5 copy (R12): photo slots for the art-direction rules (docs/research/2026-10-31-art-direction-analysis.md §4).
// Photos are uploaded from the back office later; the mockup shows where each one goes and its spec.
export const homeV5Copy = {
  photo: {
    hero: { label: "倉庫實景照", spec: "後台上傳 · 16:9、寬 2400px 以上 · 倉庫一排設備或看機區" },
    card: { label: "商品實拍", spec: "4:3 · 淺色統一背景 · 3/4 正面" },
    visit: { label: "看機區實景", spec: "後台上傳 · 4:3" },
  },
  brandsNote: "正式版換成品牌 logo",
} as const;

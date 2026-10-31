# Mockups

> **身分：提案（2026-10-31）**——等用戶確認視覺設計。確認後改成「待落地」；元件接上真資料後改成「已落地」，並在這裡註明落地的 commit。
> 稿是證據不是權威：視覺規則的權威是 `docs/frontend-design-principles.md` §B0 和 `src/theme/tokens.ts`。

## 怎麼看

```bash
pnpm dev -p 3200          # 只在 dev server 開放
open http://localhost:3200/mockup
```

- 用 `localhost`，不要用 `127.0.0.1`：Next 16 dev server 會擋其他來源的 dev 資源，頁面不會 hydrate，看起來正常但什麼都點不動（AGENTS.md Miscellaneous）。
- production build 由 `src/proxy.ts` 對 `/mockup` 回 404；`ENABLE_MOCKUPS=1` 才開放。`e2e/mockup-gate.spec.ts` 驗證這件事。
- 頁面都是真的 antd 元件，用 `src/app/mockup/_data.ts` 的範例資料（許可證字號刻意用 000xxx）。元件放在 `src/components/{catalog,admin}`，接真資料時直接沿用。

## 畫面清單（截圖在 `2026-10-31/`，桌機 1440、手機 390）

| 畫面 | 路徑 | 截圖 |
|---|---|---|
| 首頁 | `/mockup/site` | `home-desk.png` `home-mobile.png` |
| 商品列表 | `/mockup/site/products` | `list-*.png` |
| 列表：搜尋無結果 | `/mockup/site/products?q=MRI` | `list-empty-*.png` |
| 列表：載入中 | `/mockup/site/products?state=loading` | `list-loading-*.png` |
| 商品頁（含詢價表單） | `/mockup/site/products/p1` | `detail-*.png` |
| 商品頁：已售出 | `/mockup/site/products/p4` | `detail-sold-*.png` |
| 後台登入（帳號不在白名單） | `/mockup/admin/login?denied=1` | `login-*.png` |
| 後台商品管理 | `/mockup/admin/products` | `admin-products-*.png` |
| 新增商品 | `/mockup/admin/products/new` | `admin-new-*.png` |
| 編輯商品 | `/mockup/admin/products/p1` | `admin-edit-*.png` |
| 詢價紀錄 | `/mockup/admin/inquiries` | `admin-inquiries-*.png` |

## 設計決策（§C 迴圈的紀錄）

**參考（§A5，2026-10-31 Playwright 實測）**

| 參考 | 做對的 | 最弱的 | 我們怎麼做 |
|---|---|---|---|
| used-equip（台灣、測試儀器） | 分類側欄＋卡片格線；商品頁上圖下規格 | 規格文字牆、圖片比例不一、沒有價格也沒有詢價鈕、首屏 1/3 是輪播 | 規格改成表格；圖片固定 4:3；價格或「歡迎詢價」＋詢價鈕放首屏 |
| Soma Tech（美國、醫材） | 頁首常駐搜尋框；依製造商瀏覽；Quote Cart | 分類頁開頭是大段療效文案（台灣會落在醫材法 §40） | 頁首搜尋＋品牌篩選；不放療效文案，後台還會警告 |
| Block Imaging（美國、影像設備） | 單一主行動（Contact Us）很清楚 | 首頁只有人物照片 hero，看不到設備 | 首頁直接放分類與最新上架 |

DOTmed（403 擋自動化瀏覽器）、MedWOW（憑證無效）沒有截到圖，**未查證**。

**Signature（§C4，整份設計唯一的記憶點）**：設備銘牌。商品頁把許可證字號、品牌、型號、年份、保固、狀況排成一塊四角有螺絲的銘牌，卡片上也有縮小版的許可證行。理由：真實設備就有這塊牌子，而且它把法規要求的欄位擺在最前面，不是藏在頁尾。其他地方保持安靜：海軍藍、4px 圓角、平面、不做輪播。

**後台**：14px 密度；編輯頁右側固定「上架前檢查」清單（許可證字號、圖片、中文品名、分類），沒全過就不能按「上架」，把 R11 變成看得見的 UI；規格可以貼上原廠文字自動拆列（`src/modules/catalog/spec-parse.ts`，有測試）；產品訊息寫到療效字詞會跳警告。

## 還不是真的

這些按鈕只有畫面：存草稿、上架、上傳（不會真的存）、Google 登入、詢價送出（只切到成功畫面）、狀態更新。分類管理與站台設定沒有畫面（選單有項目但沒有連結）。

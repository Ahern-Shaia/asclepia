# Mockups

> **身分：提案（2026-10-31）**——等用戶確認視覺設計。同日依用戶指示改為「中古設備買賣」定位重拍（許可證字號改選填）。確認後改成「待落地」；元件接上真資料後改成「已落地」，並在這裡註明落地的 commit。
> 稿是證據不是權威：視覺規則的權威是 `docs/frontend-design-principles.md` §B0 和 `src/theme/tokens.ts`。

## 怎麼看

```bash
pnpm dev -p 3200          # 只在 dev server 開放
open http://localhost:3200/mockup
```

- 用 `localhost`，不要用 `127.0.0.1`：Next 16 dev server 會擋其他來源的 dev 資源，頁面不會 hydrate，看起來正常但什麼都點不動（AGENTS.md Miscellaneous）。
- production build 由 `src/proxy.ts` 對 `/mockup` 回 404；`ENABLE_MOCKUPS=1` 才開放。`e2e/mockup-gate.spec.ts` 驗證這件事。
- 頁面都是真的 antd 元件，用 `src/app/mockup/_data.ts` 的範例資料（許可證字號刻意用 000xxx，而且只有部分商品有，示範選填）。元件放在 `src/components/{catalog,admin}`，接真資料時直接沿用。

## 畫面清單（截圖在 `2026-10-31/`，桌機 1440、手機 390）

| 畫面 | 路徑 | 截圖 |
|---|---|---|
| 首頁 | `/mockup/site` | `home-desk.png` `home-mobile.png` |
| **首頁 v2（美工加強版，待 review）** | `/mockup/site-v2` | `home-v2-desk*.png` `home-v2-mobile*.png` |
| 首頁 v5「實機型錄・照片版」 | `/mockup/site-v5` | `home-v5-*.png` |
| **首頁 v5.1（只留首屏一個搜尋，對照 v5）**：差異見 `home-v5-1-changes.md` | `/mockup/site-v5-1` | `home-v5-1-*.png` |
| 商品列表 | `/mockup/site/products` | `list-*.png` |
| 列表：搜尋無結果 | `/mockup/site/products?q=MRI` | `list-empty-*.png` |
| 列表：載入中 | `/mockup/site/products?state=loading` | `list-loading-*.png` |
| 商品頁（含詢價表單） | `/mockup/site/products/p1` | `detail-*.png` |
| 商品頁：已售出 | `/mockup/site/products/p4` | `detail-sold-*.png` |
| 後台登入（帳號不在白名單） | `/mockup/admin/login?denied=1` | `login-*.png` |
| 後台商品管理 | `/mockup/admin/products` | `admin-products-*.png` |
| 新增商品 | `/mockup/admin/products/new` | `admin-new-*.png` |
| 編輯商品 | `/mockup/admin/products/p1` | `admin-edit-*.png` |
| 編輯草稿（缺中文品名，上架鈕鎖住） | `/mockup/admin/products/p7` | `admin-draft-*.png` |
| 詢價紀錄 | `/mockup/admin/inquiries` | `admin-inquiries-*.png` |

## 設計決策（§C 迴圈的紀錄）

**參考（§A5，2026-10-31 Playwright 實測）**

| 參考 | 做對的 | 最弱的 | 我們怎麼做 |
|---|---|---|---|
| used-equip（台灣、測試儀器） | 分類側欄＋卡片格線；商品頁上圖下規格 | 規格文字牆、圖片比例不一、沒有價格也沒有詢價鈕、首屏 1/3 是輪播 | 規格改成表格；圖片固定 4:3；價格或「歡迎詢價」＋詢價鈕放首屏 |
| Soma Tech（美國、醫材） | 頁首常駐搜尋框；依製造商瀏覽；Quote Cart | 分類頁開頭是大段療效文案（在台灣，寫療效等於把設備講成醫療器材，醫材法 §3、§6） | 頁首搜尋＋品牌篩選；不放療效文案，後台還會警告 |
| Block Imaging（美國、影像設備） | 單一主行動（Contact Us）很清楚 | 首頁只有人物照片 hero，看不到設備 | 首頁直接放分類與最新上架 |

DOTmed（403 擋自動化瀏覽器）、MedWOW（憑證無效）沒有截到圖，**未查證**。

**Signature（§C4，整份設計唯一的記憶點）**：設備銘牌。商品頁把品牌、型號、年份、保固、狀況排成一塊四角有螺絲的銘牌，有許可證字號的商品多一列；卡片上是「年份 · 狀況」一行。理由：真實設備就有這塊牌子，而它上面的欄位正是買中古設備的人第一眼要確認的。其他地方保持安靜：海軍藍、4px 圓角、平面、不做輪播。

**後台**：14px 密度；編輯頁右側固定「上架前檢查」清單（圖片、中文品名、分類），沒全過就不能按「上架」；醫療器材許可證字號是選填欄位，放在價格與狀況之後；規格可以貼上原廠文字自動拆列（`src/modules/catalog/spec-parse.ts`，有測試）；產品訊息寫到療效字詞會跳警告。

## 首頁 v2（2026-10-31，用戶：「前台網站缺乏美工設計，再設計一份，先做主頁」）

**主題**：中古設備商的整備場。設備圈本來就有的東西：工程線稿、掛在機器上的黃色吊牌。

- **Hero**：深海軍藍底，加上製圖方格紙紋路，畫一台超音波推車的線稿。三條引線指向三個承諾：出貨前功能檢測、保固期內免費維修、到場拆裝與運送，三句都跟商品頁的「保固與交易說明」一致。開頁時線條會依序畫出來，吊牌晃一下再停住，只在這一個地方用動畫；系統設定減少動態時不播。
- **Signature**：黃色吊牌。hero 上掛在機器上，寫「可看機／歡迎預約」（用戶 2026-10-31：不要出現「已檢測」）；商品卡左上角用同一個形狀標「保固 三個月」，只有填了保固的商品才有這張吊牌（吊牌放的是真資料，不是裝飾）。
- **其他區塊保持安靜**：區塊標題用 2px 墨色底線，像規格書的章節線；「怎麼買」用編號，因為詢價、看機、成交本來就有先後順序；頁尾是深藍底。
- 手機版：hero 的引線標籤改成線稿下方的三列條目。

**跟 §B0 規則不一致、要你同意才能改規則的地方**（目前只在 `/mockup/site-v2`，v1 不受影響）：

| §B0 規則 | v2 做法 | 理由 |
|---|---|---|
| 字級只用 12/14/16/20/24/30 | hero 標題 52px（手機 34px） | 首屏要有份量；30px 撐不起一個 hero |
| 飽和色只用在主按鈕與 active 狀態 | 新增吊牌黃 `tag` 與深海軍藍 `navyInk`（`tokens.ts`，對比度都有測試） | 黃色吊牌是 signature；只用在吊牌、hero 搜尋鈕、引線端點 |
| 動效只用 antd 預設 | hero 線稿畫出＋吊牌擺動，約 2 秒，一次性 | 整頁唯一的動畫，有 `prefers-reduced-motion` 退路 |

截圖備註：Playwright 的 `fullPage` 截圖會讓 hero 的 HTML 引線標籤消失（實際把視窗拉長就正常），所以 v2 全頁圖是把 viewport 拉到整頁高度後截的。

## 首頁風格實驗室（20 款，2026-10-31，待選）

用戶：「多設計 20 個『完全不同風格』的美學風格主頁，等我選定好再定案，也可以加入微動效」。

- 路徑：`/mockup/style-lab`（索引）→ `/mockup/style-lab/<slug>`；方向清單 `src/app/mockup/style-lab/_styles.ts`
- 20 款共用 `_content.ts` 同一份內容（不含檢測宣稱、不含療效字詞），比的只有風格
- 截圖：`2026-10-31/style-lab/<slug>-{desk,mobile}.png`；一頁總覽 `style-lab/_contact-sheet.png`
- 驗收：20 款 × 桌機／手機皆 OK（已 hydrate、無橫向捲動、單一 h1、console 零錯誤），主 session 獨立重跑確認
- 例外：style-lab 可用任意色碼、漸層與瀏覽器端 Google Fonts（守衛豁免只限此資料夾；production 由 proxy 回 404）
- agent 自行加的字（待確認）：14 拍賣行「請先來電預約」；18 博物館「展廳面積依件數比例」；12 便當格「43 件在庫」（六分類件數加總，來自範例資料）

### 實機型錄 20 變體（企業 10、嚴謹 10）

用戶：「設計 20 個變體（包含美工設計，也可以加入背景的美工設計），也加入企業風格、嚴謹風格各 10 個」。解讀為 20＝企業 10＋嚴謹 10（未確認）。

- 路徑：`/mockup/style-lab/c01…c10`、`/mockup/style-lab/r01…r10`；共用 `_v-content.ts`（與 site-v4 同結構同文案）
- 截圖總覽：`style-lab/_contact-sheet-variants.png`；個別截圖 `style-lab/<slug>-{desk,mobile}.png`
- 驗收：40/40 OK（主 session 重跑），每款「加入詢價清單」點擊後頁首件數會變（agent 以 Playwright 驗）
- style-lab 所有頁面由 `style-lab/layout.tsx` 統一加 MOCKUP 橫幅（逐頁驗證恰好 1 個）
- agent 自加、待確認的字：r01 標題欄三個統計（6 分類／43 件／7 品牌，取自資料）；r03 圖號 AS-HOME-001；r07 料號 AS-xxxx、頁碼；r08 文件編號 AS-CAT-0001、版次 A、「現行版」章；r10 圖表說明文字；c07 新增人物插畫
- 已知：c03、c09、r07 用 Chiron Hei HK（香港字形），若選中要換台灣字形字體

選定後：把該款寫成新的 §B0 profile，並更新 `tokens.ts` 與守衛，再套到列表頁、商品頁。

## 還不是真的

這些按鈕只有畫面：存草稿、上架、上傳（不會真的存）、Google 登入、詢價送出（只切到成功畫面）、狀態更新。分類管理與站台設定沒有畫面（選單有項目但沒有連結）。

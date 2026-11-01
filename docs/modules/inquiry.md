# inquiry.md — P1 詢價（含多台合併詢價）設計文件

> ✅ **狀態：APPROVED（2026-11-01）**。用戶：「全採建議」：§4.1 資料模型與 OQ-INQ-1..5 都照建議。
>
> 買家把多件商品放進「詢價清單」，一次送出一筆詢價；後台看到這筆詢價問了哪幾件。
> 用戶 2026-11-01 回覆「多台合併詢價」：「好，我先 review」。同日裁定**不加「商談中」狀態**（見 §1.3）。
> catalog.md 只定義詢價的入口（OQ-CAT-3），本檔定義詢價本身。
>
> 作者：Claude Code（草擬）
> 版本：v0.1（2026-11-01）

---

## 1. 目標與範圍

### 1.1 目標

- 商品卡和商品頁可以「加入詢價清單」，頁首（手機在底部列）顯示清單件數。
- 清單頁一次送出：聯絡資料填一次，詢問多件。
- 只問一件的人不必經過清單：商品頁保留「詢價這件」直接開表單（OQ-INQ-2）。
- 後台詢價紀錄看得到每筆問了哪幾件，以及買家送出當下看到的品名與價格。

### 1.2 依據

| 來源 | 看到的 | 查證 |
|---|---|---|
| Soma Technology | 「Quote Cart」 | `docs/research/2026-10-31-visual-synthesis.md` §2（2026-10-31 Playwright 實測） |
| Intex | 「お問い合わせ中リスト」 | 同上 |
| SemiMarket | 「Inquiry List」 | 同上 |
| 首頁 v5.1（已定案） | 頁首「詢價清單 N」、卡片「加入詢價清單」、手機底部列「詢價清單（N）」 | `/mockup/site-v5-1` |

### 1.3 不做的事

- ❌ **「商談中」商品狀態**：用戶 2026-11-01「不加」。商品狀態維持草稿／上架／下架／已售出（catalog.md OQ-CAT-8）。
- ❌ **購物車的形狀**：清單**不顯示合計金額、不填數量、沒有結帳**。R11①「前台沒有下單、付款、購物車路徑」仍然成立：詢價清單只是「我想問這幾件」，不是訂單。路由不得用 `cart`、`checkout`、`payment`（守衛 `no-checkout-path` 會擋）。
- ❌ 買家帳號、追蹤詢價進度的頁面（CLAUDE.md §0.1：不做會員）。
- ❌ 通知信（CLAUDE.md §2.4：MVP 只寫進 DB、後台查看）。

---

## 2. 既有現況走查

| 項目 | 現況 | 查法 |
|---|---|---|
| 詢價資料模型 | **還沒有 schema**，只有 mockup 型別：`MockInquiry` 帶單一 `productId` | `ls prisma/migrations` 無 migration；`src/app/mockup/_data.ts` L210–222 |
| 詢價狀態 | 未處理／已聯絡／已成交／未成交（`NEW`／`CONTACTED`／`CLOSED_WON`／`CLOSED_LOST`） | `src/copy/admin.ts` `inquiries.status` |
| 詢價表單欄位 | 姓名、電話（必填）、Email、單位（選填）、想了解什麼、同意聯絡（必填，告知保留 1 年） | `src/copy/catalog.ts` `inquiry` |
| 威脅模型 | 詢價表單是公開寫入端點：spam、個資外洩、log 印個資 | `docs/security-baseline.md` §0 #3 |
| 效能預算 | 詢價送出 ≤ 3 次 DB query | `docs/performance-baseline.md` §0 #3 |
| rate limit | 登入與詢價都要有，儲存位置待裁定 | `docs/stack-rules/nextjs-prisma-antd.md` S4-6 |

因為還沒有任何 migration，這次是**設計變更，不是資料遷移**（R1 的遷移計畫不適用）。

---

## 3. scope 切分

| 子題 | 內容 |
|---|---|
| **B1 資料模型** | `Inquiry` ＋ `InquiryItem`（§4.1） |
| **B2 前台清單** | 加入／移除、件數、清單頁、送出 |
| **B3 送出端點** | 驗證、rate limit、寫入（一個 transaction） |
| **B4 後台** | 詢價列表顯示件數，詳情列出每件（快照＋商品現況），改狀態寫 audit |

---

## 4. 設計

### 4.1 資料模型（草案，⏳ 待 review）

```prisma
model Inquiry {
  id          String         @id @default(cuid())
  status      InquiryStatus  @default(NEW)     // NEW | CONTACTED | CLOSED_WON | CLOSED_LOST
  name        String         // ≤ 50，PII
  phone       String         // ≤ 30，PII
  email       String?        // ≤ 254，PII
  org         String?        // ≤ 100，PII
  message     String?        // ≤ 2000
  consentText String         // 送出當下的同意文字全文（之後改文案也留得住證據）
  note        String?        // 內部備註，只在後台可見，≤ 2000
  createdAt   DateTime       @default(now())
  purgeAfter  DateTime       // createdAt + 1 年；到期整筆刪除（§7-bis.5）
  items       InquiryItem[]

  @@index([status, createdAt])
  @@index([purgeAfter])
}

model InquiryItem {
  inquiryId   String
  productId   String
  sortOrder   Int            // 清單裡的順序
  // 快照：買家送出當下看到的內容。商品之後改價、改名、售出，紀錄不跟著變
  titleSnap   String         // 送出當下組好的標題（品名＋該分類 inTitle 屬性，site-config.md §4.1）
  priceSnap   Decimal?       @db.Decimal(12, 0)   // null = 當時是「歡迎詢價」
  inquiry     Inquiry        @relation(fields: [inquiryId], references: [id], onDelete: Cascade)
  product     Product        @relation(fields: [productId], references: [id], onDelete: Restrict)

  @@id([inquiryId, productId])   // 同一筆詢價不會重複同一件
  @@index([productId])           // 後台「這件商品被問過幾次」
}
```

設計說明：

- **一筆詢價＝一個人＋多件商品**。單件詢價就是只有一個 item，不另外開一條路徑。
- **為什麼要快照**：後台要知道買家問的時候看到的價格。商品改價後，「他問的是 38 萬那時候」是交易糾紛的關鍵事實（security-baseline 資產②）。
- **`onDelete: Restrict`**：商品不硬刪（catalog.md 7-bis「下架或已售出的商品不硬刪」），被問過的商品更不能刪。
- **狀態在整筆詢價上，不在每件上**（OQ-INQ-3）。
- **PII 只在 `Inquiry`**，`InquiryItem` 沒有個資；整筆刪除時 item 跟著 cascade。

### 4.2 邏輯

**清單存在哪裡**（OQ-INQ-1，建議 A）：瀏覽器 `localStorage`，只存商品 id 陣列。伺服器在送出之前完全不知道清單內容。

- 讀取時用 try/catch。拿不到（無痕、封鎖）就當作空清單，「加入」鈕仍然可以用，只是重新整理後清單會消失。
- 清單頁載入時拿 id 去查商品現況：已售出、已下架的那幾件標示出來，並且**不送出**（「這件已售出，送出時不會包含」）。

**送出**（Server Action，公開端點）：

1. zod 驗證：`productIds` 1–10 個不重複的 id（OQ-INQ-4），聯絡欄位長度，`consent === true`，Email 格式；所有字串去頭尾空白、拒絕換行以外的控制字元。
2. rate limit：同一 IP 每 10 分鐘最多 5 筆（S4-6；儲存位置跟登入一起裁定）。
3. 一次查詢取回這些 id 的商品，條件 `status = PUBLISHED`。少了任何一件（已售出、下架、不存在），**整筆不寫入**，回傳是哪幾件，讓清單頁標示後重送。不靜默丟掉，因為買家以為自己問了那件。
4. 一個 transaction：寫 `Inquiry`，再用 `createMany` 寫 items（含快照）。
5. 回成功。成功後前端清空清單。

query 預算：rate limit 1＋查商品 1＋transaction 內 insert 2＝4 次，**超過 §0 的 ≤ 3**。兩個做法擇一，⏳ 實作時用 `expectMaxQueries` 量過再定：
- (a) rate limit 放在記憶體（單實例才成立）；
- (b) 把預算改成「≤ 3＋rate limit 1」並寫回 performance-baseline。

### 4.3 UI

| 位置 | 畫面 |
|---|---|
| 商品卡 | 「＋ 加入詢價清單」，已加入時顯示「✓ 已在清單」（再按移除）。已售出的卡沒有這顆鈕 |
| 商品頁 | 主要按鈕「詢價這件」（直接開表單，只含這一件）；次要按鈕「加入詢價清單」；「預約看機」並列（§B0 商品頁） |
| 頁首／手機底部列 | 「詢價清單 N」，連到清單頁 |
| 清單頁 `/inquiry` | 每件一列：縮圖、品牌型號、中文品名、價格、移除鈕；下面是聯絡表單（欄位同現有詢價表單）。**不顯示合計** |
| 空清單 | 「清單是空的。在商品上按『加入詢價清單』，就能一次詢問多台。」＋「看全部商品」 |
| 送出成功 | 「已收到你的詢價（N 件）」，並列出件名；沿用現有句子「我們會在一個工作天內以電話聯絡你。急件請直接來電。」 |
| 有一件已售出 | 「〈品名〉已售出，請移除後再送出。」那一列標示已售出 |
| 後台詢價列表 | 「詢價商品」欄：第一件品名＋「等 N 件」 |
| 後台詢價詳情 | 每件一列：快照品名與價格、商品**現在的**狀態與價格（不同時標示「已變更」）、連到後台商品頁 |

---

## 7-bis. cross-cutting 檢核（Mode B）

### 7-bis.1 安全模型

| 攻擊面 | 緩解 | 實作 |
|---|---|---|
| 灌爆詢價（spam） | rate limit；每筆最多 10 件；只收上架中的商品 id | §4.2 步驟 1–3；bot 防護（Turnstile 等）上線前再定 |
| 用 id 探測未上架商品 | 回傳只說「這幾件目前無法詢價」，不分辨是草稿、下架還是不存在 | §4.2 步驟 3 |
| 後台看詢價（BOLA） | 後台讀取全部走 `requireAdmin()`；詢價 id 不出現在前台任何回應 | catalog.md A4 |
| 個資進 log | 只經過 `src/server/log.ts`（redact `name`、`phone`、`email`） | stack-rules S6-2 |
| localStorage 被竄改 | 裡面只有商品 id，伺服器每次重新驗證；不存任何個資 | §4.2 |

輸入驗證：姓名 ≤ 50、電話 ≤ 30（只收數字、空白、`+-()#`）、Email ≤ 254、單位 ≤ 100、留言 ≤ 2000、`productIds` 1–10 個且不重複。

### 7-bis.2 容量

詢價量預估每天個位數到數十筆；每筆最多 10 個 item。一年 ≤ 1 萬筆 Inquiry、≤ 10 萬筆 item，到期刪除，不會無限增長。

### 7-bis.3 失效模式

| 路徑 | 處理 |
|---|---|
| DB 寫入失敗 | transaction 回滾，整筆不留；回「詢價沒有送出，請再試一次，或直接來電 02-…」。清單**不清空** |
| 送出時商品剛好售出 | 整筆不寫，回傳是哪件（§4.2 步驟 3） |
| 同一人連按兩次 | 前端送出中鎖住按鈕；伺服器不去重（同一人再問一次是合理的），rate limit 擋大量重送 |

### 7-bis.4 觀測

- 結構化 log：`inquiry.submit`，記 `itemCount`、結果、拒絕原因（`rate_limited`／`unavailable_items`／`invalid`），**不記任何聯絡欄位**。
- audit（R5）：後台改詢價狀態、寫備註都記 actor、action、target、時間、結果。

### 7-bis.5 資料生命週期

- **PII**：`Inquiry` 的 name、phone、email、org、message。
- **保留期**：1 年（表單上已經告知）。每天清除 `purgeAfter < now()` 的整筆資料，item 跟著刪。清除排程放哪裡跟部署平台一起定（CLAUDE.md §2.4）。
- **當事人要求刪除**：後台詳情頁加「刪除這筆詢價」，寫 audit（只記 id，不記內容）。

### 7-bis.6 兼容與 rollout

全新表，沒有舊資料。mockup 的 `MockInquiry.productId` 改成 `items[]`，在列表頁與商品頁 mockup 一起改。

### 7-bis.7 成本

每筆詢價 4 次以內的 DB query，資料量小，不新增外部服務。

---

## 8. 測試策略

| 層級 | 覆蓋 |
|---|---|
| Unit | zod schema：0 件、11 件、重複 id、電話含字母、consent=false 都拒絕 |
| Integration（低權 app role） | 3 件全上架 → 1 筆 Inquiry＋3 筆 item，快照正確；其中 1 件已售出 → 0 筆寫入並回那一件；改商品價格後，詢價的 `priceSnap` 不變；`expectMaxQueries` 量送出路徑；未登入讀不到後台詢價 |
| E2E | 加入 2 件 → 頁首顯示 2 → 清單頁送出 → 成功頁列出 2 件；商品頁「詢價這件」只含 1 件；空清單狀態；localStorage 被封鎖時仍能用「詢價這件」 |

## 9. 里程碑

| 里程碑 | 內容 | 狀態 |
|---|---|---|
| **M0** | 本檔 → APPROVED | ✅ 2026-11-01 |
| M0-ui | 列表頁、商品頁、清單頁 mockup（依 §B0 `inspect-catalog`） | ⏳ |
| M1 | B1＋B3（跟 catalog M1 同一批 migration） | ⏳ |
| M2 | B2 前台清單 | ⏳ |
| M3 | B4 後台 | ⏳ |
| M4 | §12 FMEA、SOP | ⏳ |

---

## 10. 開放問題（OQ-INQ-N）— ✅ 用戶 2026-11-01「全採建議」

| # | 問題 | 選項 | 建議 |
|---|---|---|---|
| **OQ-INQ-1** | 清單存在哪裡 | A. 瀏覽器 localStorage · B. 伺服器端（cookie 綁一個匿名清單） | **A**：送出前伺服器不碰任何資料，沒有新的公開寫入端點，也不用處理過期清單；代價是換手機或換瀏覽器清單不會跟著走 |
| **OQ-INQ-2** | 商品頁的詢價按鈕 | A. 「詢價這件」＋「加入詢價清單」都有 · B. 只有「加入詢價清單」 | **A**：只問一件的人一步就到；B 多一個步驟（先加入、再去清單頁） |
| **OQ-INQ-3** | 狀態放在哪一層 | A. 整筆詢價一個狀態 · B. 每件各自一個狀態 | **A**：MVP 夠用。一筆問三台、成交一台時，在備註寫明；商品本身另外標已售出 |
| **OQ-INQ-4** | 一筆最多幾件 | 5 · **10** · 20 | **10**：涵蓋一間診所一次換一批設備；上限越高，被灌爆時越貴 |
| **OQ-INQ-5** | 清單裡有一件已售出時 | A. 整筆擋下，請買家移除後重送 · B. 自動略過那件，其他照送 | **A**：B 會讓買家以為問了那件；A 多一步，但不會有誤會 |

---

## 12. 失效場景反思（FMEA）— 收尾必填（R17）

> M4 時逐路徑補齊。目前已知的：

| 失效 | 影響 | 嚴重度 | 緩解 |
|---|---|---|---|
| 買家以為送出了，其實失敗 | 漏接詢價 | P0 | 失敗時清單不清空、畫面明說沒送出並給電話（§7-bis.3） |
| 詢價紀錄的價格跟著商品改價變動 | 交易糾紛無據 | P1 | item 快照（§4.1） |
| 清單變成購物車（合計、數量） | 違反 R11① | P1 | §1.3 明文禁止；守衛擋路由名稱 |

## 13. 變更紀錄

| 日期 | 版本 | 變更 | 作者 |
|---|---|---|---|
| 2026-11-01 | v0.1 | 初版 DRAFT：多台合併詢價資料模型、OQ-INQ-1..5；記錄「不加商談中」 | Claude Code |
| 2026-11-01 | v0.2 | 用戶「全採建議」：OQ-INQ-1..5 照建議（A／A／A／10／A），DRAFT → APPROVED | Claude Code |

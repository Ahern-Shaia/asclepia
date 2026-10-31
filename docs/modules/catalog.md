# catalog.md — P1 商品型錄與後台上架 設計文件

> ✅ **狀態：APPROVED（2026-10-31）**。OQ-CAT-1..9 已裁定（§10）。進 M1 前還缺兩項：相依套件核准（§7-bis）、git init。初始分類清單由用戶提供，不卡 M1。
>
> 前台商品頁照參考頁 [used-equip /product/22/67](https://www.used-equip.com.tw/product/22/67) 的內容結構；所有商品（圖片、資訊）都從後台上傳。這是 MVP 的核心模組，詢價（inquiry）是另一個模組，本檔只定義它的入口。
>
> 作者：Claude Code（草擬）
> 版本：v0.2（2026-10-31）
>
> **v0.2 修訂（用戶 2026-10-31：「當作中古器材買賣就行，我賣的是設備，不是『醫療』器材」）**：網站定位從醫療器材型錄改為中古設備買賣。`licenseNo` 改選填、拿掉「上架必填」的 DB CHECK；收購來源改成一般來歷紀錄（`sourceContact`）。資料模型變更依 R6 隨本次修訂一併送用戶確認。法規邊界見 research §5。

---

## 1. 目標與範圍

### 1.1 目標

1. 員工能在後台**新增商品**：上傳多張圖片（可排序、可指定主圖），填寫品牌、型號、品名、產品訊息、規格、特色，存成草稿或直接上架
2. 員工能**編輯、下架、標記已售出**，每一筆寫入都留 audit（R5）
3. 訪客能在前台**依分類瀏覽、搜尋**；商品頁的區塊順序跟參考頁一致（§4.3）
4. 上架前檢查：至少 1 張圖片、中文品名、分類，缺一項不能上架。醫療器材許可證字號**選填**，有填才顯示（v0.2）

### 1.2 不做的事

- ❌ 線上下單、購物車、付款（MVP 範圍，用戶 2026-10-31 裁定；R11）
- ❌ 富文本編輯器（HTML 欄位等於 stored XSS 面，規格改用結構化欄位，見 OQ-CAT-2）
- ❌ 外部賣場連結（參考頁有 Yahoo、露天連結；見 OQ-CAT-4）
- ❌ 多語系（R12）
- ❌ 批次匯入 CSV（真實庫存量確認後再評估）

---

## 2. 參考頁走查（查證日 2026-10-31，逐區塊對照）

參考頁 https://www.used-equip.com.tw/product/22/67 由上到下：

| # | 參考頁區塊（逐字） | 本站對應 | 後台怎麼輸入 |
|---|---|---|---|
| 1 | 左側分類清單「商品資訊 / product」，27 個扁平分類 | `Category`（扁平、可排序） | 後台分類管理（OQ-CAT-9） |
| 2 | 分類標題「### 通訊協定分析儀」 | 商品所屬分類 | 下拉選單 |
| 3 | 主圖 **1 張**，沒有縮圖列 | `ProductImage[]`，**支援多張**，第一張是主圖 | 拖曳上傳、拖曳排序 |
| 4 | 標題「ASTRO VA-1842 HDMI2.0+HDCP2.2 Protocol Analyzer HDMI2.0+HDCP2.2 通訊協定分析儀」＝品牌＋型號＋英文品名＋中文品名 | 標題由四個欄位組成（OQ-CAT-1） | 四個欄位分開填 |
| 5 | 品牌型號區塊：「ASTRO」「VA-1842」「HDMI Protocol Analyzer」「HDMI2.0+HDCP2.2 通訊協定分析儀」 | `brand` `model` `nameEn` `nameZh` | 同上 |
| 6 | Yahoo、露天賣場圖示連結 | 不做（OQ-CAT-4） | — |
| 7 | 「產品訊息」條列 8 點 | `highlights: string[]` | 一行一點 |
| 8 | 「規格:」編號條列 ＋「頻寬:」「HDCP規格:」這類「標籤: 值」行 | `ProductSpec[]`（標籤、值、排序）＋ `specNote`（純文字補充） | 動態列＋**貼上原廠規格自動拆列**（OQ-CAT-2） |
| 9 | 「### Main Features」英文條列約 20 點 | `features: string[]` | 一行一點 |
| 10 | 英文規格「HDMI Input」「Pixel Clock」… | 併入 `ProductSpec[]`，標籤不限語言 | 同 #8 |
| 11 | 「〔 回列表 〕」 | 回到分類列表（保留篩選條件） | — |
| 12 | 頁尾電話、傳真、email、地址 | 站台設定（`SiteSetting`） | 後台設定頁 |
| — | **參考頁沒有、本站要加的** | | |
| A | 醫療器材許可證字號（選填） | `licenseNo`，有值才在銘牌最後一列顯示（v0.2） | 選填欄位 |
| B | 詢價入口 | 「詢價這件商品」按鈕（OQ-CAT-3） | — |
| C | 價格、狀況、保固 | 選填（OQ-CAT-5） | 選填欄位 |
| D | 商品狀態 | 草稿／上架／下架／已售出（OQ-CAT-8） | 狀態切換 |
| E | 收購來源（來歷紀錄） | `sourceName` `sourceContact`，**只在後台可見** | 選填 |

上游現況：repo 裡沒有程式碼（查法：`find . -name '*.ts*' -not -path './node_modules/*'` 回 0 筆），所以全部是新做。

---

## 3. scope 切分

| 子題 | 內容 |
|---|---|
| **A1 資料模型＋後台商品 CRUD** | Prisma schema、migration、後台列表與表單、狀態切換、audit |
| **A2 圖片上傳管線** | 驗證、重新編碼、去 EXIF、產生尺寸、排序、指定主圖 |
| **A3 前台型錄** | 分類列表（cursor 分頁 ≤ 48 筆）、搜尋、商品頁（照 §2 區塊順序）、SEO meta |
| **A4 後台登入** | Auth.js、只有白名單帳號能登入、`requireAdmin()` 單一入口 |

---

## 4. 設計

### 4.1 資料模型（草案，型別示意，非最終 schema）

```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  sortOrder Int
  products  Product[]
}

model Product {
  id              String        @id @default(cuid())
  categoryId      String
  status          ProductStatus @default(DRAFT)   // DRAFT | PUBLISHED | HIDDEN | SOLD
  brand           String        // ≤ 80
  model           String        // ≤ 80
  nameEn          String?       // ≤ 160
  nameZh          String        // ≤ 160
  licenseNo       String?       // 選填；只有醫療器材才有（v0.2 拿掉上架必填 CHECK）
  priceTwd        Decimal?      @db.Decimal(12, 0)  // null = 歡迎詢價
  condition       String?       // OQ-CAT-5
  warranty        String?       // OQ-CAT-5
  highlights      String[]      // 產品訊息，≤ 30 點
  features        String[]      // Main Features，≤ 50 點
  specNote        String?       // 純文字，≤ 5000 字
  sourceName      String?       // 收購來源，只在後台可見
  sourceContact   String?
  publishedAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  specs           ProductSpec[]
  images          ProductImage[]
}

model ProductSpec  { productId String; sortOrder Int; label String /* ≤ 80 */; value String /* ≤ 500 */; @@id([productId, sortOrder]) }
model ProductImage { id String @id; productId String; sortOrder Int; storageKey String; width Int; height Int; alt String? }
model AuditLog     { id BigInt @id @default(autoincrement()); actorId String; action String; targetType String; targetId String; result String; diff Json?; at DateTime @default(now()) }
```

- `ProductSpec` 是複合主鍵，所以所有 predicate 都要帶 `productId`
- `AuditLog`：app role 只有 INSERT 和 SELECT 權限，另外加 trigger 拒絕 UPDATE 和 DELETE（R5，security-baseline「audit 不可變」）
- 數量上限（30 點、50 點、20 張圖）用 zod 在伺服器端驗，**不信任前端**

### 4.2 圖片上傳管線（A2）

```
瀏覽器選檔 → Server Action（requireAdmin）
  → 驗大小（≤ 15MB/張、≤ 20 張/商品）與 magic bytes（只收 JPEG/PNG/WebP；SVG、HEIC 都拒收）
  → sharp：自動轉正 → 去除全部 metadata（EXIF/GPS）→ 輸出 WebP 1600px 與 400px 兩種尺寸
  → 存進 storage 介面（開發期放本機 `./.uploads/`，prod 等 §2.4 決定）
  → 寫入 ProductImage ＋ audit
```

- 原圖不留，只存重新編碼後的檔：重新編碼本身就是把夾帶的內容洗掉
- 檔名用隨機 key，不使用上傳檔名（擋 path traversal，也不會洩漏內部檔名）
- 轉檔失敗時回人看得懂的句子：「這張圖片無法讀取，請改用 JPG 或 PNG 格式」，不回 sharp 的錯誤原文

### 4.3 UI

**後台商品表單**，由上到下照前台的顯示順序排列，員工填完就知道前台長什麼樣：
分類 → 圖片（拖曳上傳＋排序）→ 品牌／型號／英文品名／中文品名（旁邊即時預覽組好的標題）→ 產品訊息 → 規格（動態列＋「貼上原廠規格」按鈕）→ Main Features → 價格／狀況／保固 → 醫療器材許可證（選填）→ 收購來源（標「僅後台可見」）→ 〔存草稿〕〔上架〕

- 「上架」時才檢查圖片、中文品名、分類，存草稿不檢查
- 文案欄位有療效字詞守衛（R11 ②）：送出時警告，列出命中的詞，不硬擋（守衛會誤判），但會寫進 audit

**前台商品頁**，區塊順序照 §2：分類標題 → 圖片（主圖＋縮圖列）→ 標題 → 設備銘牌（品牌、型號、年份、保固、狀況；有許可證字號才多一列）→ 〔詢價這件商品〕→ 產品訊息 → 規格表 → Main Features → 回列表。
視覺依 `spec-catalog` profile。8 項細節在前端 M0 寫定後才開始做畫面（`frontend-design-principles.md` §B0）。

---

## 7-bis. cross-cutting 檢核（Mode B）

| 面向 | 內容 |
|---|---|
| **安全** | 後台 mutation 全部走 `requireAdmin()`；e2e 驗證「未登入打 Server Action 回 401」；上傳管線見 §4.2；所有文字欄位用 zod 驗長度，React 預設跳脫，不使用 `dangerouslySetInnerHTML` |
| **新增相依（§5.3 需要核准）** | `sharp`（圖片重新編碼；next/image 本身就依賴它）· `zod`（輸入驗證）· 拖曳排序套件等前端 M0 再選。授權都要讀 LICENSE 本文確認 |
| **容量** | 預估商品百到千件、每件 ≤ 20 張圖。列表查詢走 `(status, categoryId, publishedAt)` index＋cursor 分頁 |
| **失效** | 圖片轉檔逾時 30s 就失敗，並回人看得懂的句子；storage 寫入失敗時不寫 DB 列（先寫檔、後寫列，留下的孤兒檔由定期清理處理） |
| **觀測** | audit log 本身就是後台操作紀錄；轉檔失敗用結構化 log 記下 productId 與原因，不記檔案內容 |
| **資料生命週期** | 本模組沒有 PII；收購來源只在後台可見。下架或已售出的商品不硬刪（保留成交與來歷紀錄） |
| **兼容** | 全新表，沒有遷移負擔 |
| **成本** | 圖片儲存：1000 件 × 20 張 × 約 400KB ≈ 8GB，等 §2.4 部署決定後再估月費 |

## 8. 測試策略

| 層級 | 覆蓋 |
|---|---|
| Unit | 標題組合、規格貼上解析（陽性：參考頁那段規格文字；陰性：空字串、沒有冒號的行）、療效字詞守衛 |
| Integration（testcontainers，低權 app role） | 缺圖片／中文品名／分類的商品無法上架；audit 的 UPDATE、DELETE 會被拒 |
| E2E（Playwright） | 後台上架完整流程（上傳 3 張圖 → 排序 → 上架 → 前台看得到）；缺中文品名無法上架；未登入打不到後台 |

## 9. 里程碑

| 里程碑 | 內容 | 狀態 |
|---|---|---|
| **M0** | 本檔 → APPROVED | ⏳ |
| **M1** | A4 登入＋A1 資料模型與後台 CRUD | ⏳ |
| **M2** | A2 圖片管線 | ⏳ |
| **M3** | A3 前台型錄（前提：前端 M0 profile 已寫定） | ⏳ |
| **M4** | SOP（後台上架操作手冊）＋ smoke | ⏳ |
| **M5** | §12 FMEA | ⏳ |

## 10. 開放問題 — 已裁定（2026-10-31）

| # | 裁定 | 方式 |
|---|---|---|
| OQ-CAT-2 | **A** 結構化列＋貼上解析 | 用戶選定 |
| OQ-CAT-3 | **A** 詢價表單（帶入商品）＋電話 | 用戶選定 |
| OQ-CAT-6 | **A** Google 登入＋email 白名單 | 用戶選定 |
| OQ-CAT-9 | **A** 後台可以管理分類；**初始清單由用戶提供** | 用戶選定 |
| OQ-CAT-1 / 4 / 5 / 7 / 8 | 都採下表的建議（A） | Mode B：研究錨定的建議視為已核准；用戶有異議就改這一列 |

原始選項與理由：

| # | 議題 | 選項 | 建議 |
|---|---|---|---|
| **OQ-CAT-1** | 標題怎麼來 | A. 由品牌＋型號＋英文品名＋中文品名自動組合 · B. 另外一欄自由輸入 | **A** — 參考頁的標題就是這四個欄位的組合；分開輸入會出現標題和欄位不一致（參考頁的「HDMI2.0+HDCP2.2」就重複了兩次） |
| **OQ-CAT-2** | 規格怎麼輸入 | A. 結構化「標籤／值」列＋貼上原廠規格自動拆列 · B. 一個富文本框 | **A** — 前台版面能保持一致，以後可以依規格篩選，也沒有 HTML 注入面；貼上解析讓輸入速度跟富文本差不多 |
| **OQ-CAT-3** | 詢價入口 | A. 商品頁有詢價表單（自動帶入商品）＋電話 · B. 只放電話、email（同參考頁） · C. 加 LINE | **A** — 後台看得到每筆詢價問的是哪件商品；B 最簡單，但詢價來源無從追蹤 |
| **OQ-CAT-4** | 要不要外部賣場連結（Yahoo、露天） | A. 不做 · B. 做 | **A** — MVP 先不做。（v0.1 的理由是通訊交易規定第四點；v0.2 改定位為設備買賣後，這個理由只對醫療器材品項成立。要連拍賣網時再重開這題） |
| **OQ-CAT-5** | 價格、狀況、保固 | A. 都選填，價格空白時顯示「歡迎詢價」 · B. 都不顯示（同參考頁） | **A** — 選填就涵蓋了 B 的情況；參考站在服務頁寫了「一律提供三個月保固」，可以做成站台預設值 |
| **OQ-CAT-6** | 後台登入方式 | A. Google 登入＋email 白名單 · B. 帳號密碼（Argon2id） | 公司用 Google Workspace 選 **A**（不必自己保管密碼）；沒有的話選 B |
| **OQ-CAT-7** | 後台角色 | A. 單一 admin · B. admin＋editor | **A** — MVP 人數少；`requireAdmin()` 單一入口，以後要拆角色也很容易 |
| **OQ-CAT-8** | 已售出的商品 | A. 繼續顯示並標「已售出」 · B. 直接從前台消失 | **A** — 保留 SEO 流量，也讓買家看得出公司的成交量 |
| **OQ-CAT-9** | 分類 | A. 後台可以增、刪、排序 · B. 寫死在程式碼裡 | **A**，另外請你**給初始分類清單**：參考頁的 27 類是電子儀器，不能沿用 |

### 10-bis. 新增開放問題（2026-10-31）

| # | 議題 | 選項 | 建議 |
|---|---|---|---|
| **OQ-CAT-10** | 首頁倉庫實景照、看機區照、品牌 logo 從哪裡上傳（美工規範 A1／A7，`docs/research/2026-10-31-art-direction-analysis.md`） | A. 後台「站台設定」加照片欄位（走同一條圖片管線 A2） · B. 先寫死在程式碼裡，換照片要改版 | **A** — 用戶說照片會從後台上傳；站台設定本來就有（§2 #12 頁尾聯絡資訊），只是多幾個圖片欄位。待用戶裁定後補進 §6 資料模型 |

## 12. 失效場景反思（FMEA）

M5 收尾時填（R17）。目前還沒有實作，沒有路徑可以列。

## 13. 變更紀錄

| 日期 | 版本 | 變更 | 作者 |
|---|---|---|---|
| 2026-10-31 | v0.1 | 初版 DRAFT：參考頁逐區塊對照、資料模型草案、OQ-CAT-1..9 | Claude Code |
| 2026-10-31 | v0.2 | OQ-CAT-2/3/6/9 由用戶裁定，1/4/5/7/8 採建議；DRAFT → APPROVED | Claude Code |

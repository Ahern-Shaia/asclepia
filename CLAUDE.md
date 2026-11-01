@AGENTS.md

# CLAUDE.md — Asclepia 開發指引

> 本文件是 Claude Code 在 Asclepia 中的最高指導原則。所有開發任務開始前，Claude Code 必須先讀完本文件。

> 狀態：**Scaffold 完成（2026-10-31）**：Next.js 16 + antd 6 骨架，`pnpm check` 和 `pnpm test:e2e` 全綠。下一步是 catalog M1，與 site-config C1、inquiry B1 同一批 schema（三份設計都已 APPROVED）。
>
> 網站定位是**中古設備買賣**（用戶 2026-10-31：「當作中古器材買賣就行，我賣的是設備，不是『醫療』器材」）：自營賣中古院所設備與檢驗設備，前台是型錄＋詢價，後台負責上架。
> 棧規則附件：`docs/stack-rules/nextjs-prisma-antd.md`（R21，✅ 用戶 2026-11-01 照草案生效；執法點隨各模組 M1 起逐條接線）。商品模組設計：`docs/modules/catalog.md`（APPROVED；v0.2 定位修訂待用戶確認）。視覺：profile `inspect-catalog`「實機型錄」（用戶 2026-11-01 定案，基準稿 `/mockup/site-v5-1`，規則在 `frontend-design-principles.md` §B0）；mockup 清單 `docs/mockups/README.md`。
> 🔴 法規邊界：一件設備算不算醫療器材，依醫材法 §3 看它的設計與用途（診斷、治療…），不看新舊或賣方怎麼稱呼（research §5）。哪些品項落在線內**不屬於 Claude Code 可以裁定的事**（R7），送律師或衛生局 🔒。

---

## 0. 專案身份

- **名稱**：Asclepia
- **用途**：本公司自營的中古設備買賣網站。前台提供型錄與詢價，後台負責上架。
- **語言**：TypeScript
- **運行**：單一 Next.js 應用（前台和後台在同一個 repo）＋ PostgreSQL；部署平台未定（§2.4）
- **授權**：proprietary（用戶未指明，先用預設）
- **Git remote**：https://github.com/Ahern-Shaia/asclepia（private，2026-10-31 由用戶建立並推送 `main`）

### 0.1 定位 ≠ MVP（pre-dev #1 #3）

**一句話**：一家公司自營的中古院所與檢驗設備線上型錄。買家看得到照片、規格和狀況，詢價後到場看機，線下成交。

**完整定位**：自營車行模式。業務組合跟參考站 [used-equip](https://www.used-equip.com.tw/service) 一樣是「銷售／收購／維修／租賃」，參考站賣電子測試儀器、沒有醫材商執照，本站比照它做一般中古設備買賣（研究見 `docs/research/2026-10-31-reference-and-regulation.md` §1）。
- **唯一賣方**：本公司
- **買方**：醫療器材商、一般民眾
- **品類**：院所專業設備、檢驗／實驗室設備

**MVP**（用戶 2026-10-31：「參考這個網站就好」＋「商品我要從後台上傳，圖片、資訊等等」）：
- 前台型錄：分類、搜尋、商品頁。商品頁區塊照 [used-equip /product/22/67](https://www.used-equip.com.tw/product/22/67)，逐區塊對照表見 `docs/modules/catalog.md` §2
- **後台上傳**：圖片（多張、可排序）、品名、產品訊息、規格、特色，以及該分類的屬性（預設是品牌、型號、年份、狀況、保固）；可以存草稿、上架、下架、標記已售出
- **後台可設定**（用戶 2026-11-01：「任何商品都要能用，透過管理後台設定」，形態＝只有本公司使用）：店家資料、分類、商品屬性、主題（2 色＋圓角）、首頁區塊、文案、功能開關。網站本身不限商品類型，本公司用它賣中古設備。設計：`docs/modules/site-config.md`
- **多台合併詢價**：`docs/modules/inquiry.md`
- 商品頁詢價表單（自動帶入商品）＋電話，後台查看詢價（OQ-CAT-3）
- 後台用 Google 登入，只有白名單帳號能進（OQ-CAT-6）

| 定位有、MVP 沒有 | 裁定 |
|---|---|
| 收購估價 | 用戶 2026-10-31 裁定 MVP 只做型錄＋詢價 |
| 維修／租賃預約 | 同一次裁定，MVP 不做 |

| 不做 | 理由 |
|---|---|
| 第三方刊登／多賣家 | 用戶裁定採自營（2026-10-31） |
| 線上下單付款 | 用戶裁定 MVP 只做型錄＋詢價（2026-10-31）。若日後要開，品項中屬醫療器材者受通訊交易規定第四點限制（research §3），開做前先 🔒 |
| 買家會員系統 | 詢價用不到會員，個資收越少越好 |
| 療效／醫療效能文案 | 醫材法 §3 以「診斷、治療、緩解…」定義醫療器材：商品文案寫療效，等於自己把設備講成醫療器材，文案也會落入 §6 醫療器材廣告 |

### 0.2 開工前決策紀錄（`docs/pre-dev-decisions.md` 25 格）

| # | 決策 | 狀態 |
|---|---|---|
| 1 / 3 | §0.1 | ✅ |
| 2 分母 | 品類：公司現有庫存（初始分類清單由用戶提供）。商品頁欄位：參考站商品頁。法規：醫材法全文（只用來畫「哪些品項算醫療器材」的邊界，research §5） | ✅ 來源見 research |
| 4 首位使用者 | 本公司。真實資料＝公司現有庫存 | ⏳ 請提供 10–20 筆真實商品，當資料模型的壓力測試 |
| 5 棧 | §2.0 對照表 | ✅；棧規則 ⏳ scaffold 後同一天生成（產生器要讀實際鎖檔版本） |
| 6 資料根 | **單租戶**（唯一賣方，不做 RLS 多租戶）· 後台角色 deny-by-default · 金額存 TWD 整數 `Decimal(12,0)`，null＝詢價，禁用 float · audit 只能新增（append-only）· 商品留收購來源欄位（來歷紀錄，只在後台可見） | ✅ |
| 7 授權 | 專案 proprietary。相依套件只收 MIT／BSD／Apache-2.0／ISC，其他授權逐案讀 LICENSE 本文 | ✅ |
| 8 fork／自研 | 自研。參考站只看功能的形狀，不抄程式碼、文案、圖片 | ✅ |
| 9 repo 形態 | 單一 Next.js app 的 modular monolith（`src/modules/<domain>`）。dependency-cruiser 進 CI，擋循環依賴和跨模組 deep import | ✅ |
| 10bis 威脅／效能 | `security-baseline.md` §0 · `performance-baseline.md` §0 | ✅ 用戶 2026-11-01「全部照草案生效」 |
| 10 測試分層 | Vitest（單元）· testcontainers Postgres（整合，走低權 app role）· Playwright（e2e）· junit reporter 寫在 config 裡 | ✅ |
| 11 視覺權威 | `docs/frontend-design-principles.md` ＋ `src/theme/tokens.ts` | ✅ |
| 12 母心智模型 | 醫材商腦中是原廠型錄和規格表；民眾腦中是拍賣網商品頁（參考站本身外連 Yahoo、露天賣場） | ✅ 參考站已用 Playwright 實測（research §1b） |
| 13 可稽核視覺規則 | profile＝自訂 `inspect-catalog`「實機型錄」＋antd（R16，用戶 2026-11-01 定案，基準稿 `/mockup/site-v5-1`）；規則與執法點見 `frontend-design-principles.md` §B0 | ✅ |
| 14 mockup | 放 `docs/mockups/`，檔頭標身分（提案／待落地／已落地／棄用／競品）。2026-10-31 前台與後台 mockup：身分＝提案，用 antd 實際渲染 | ✅ 制度；⏳ 等用戶確認視覺 |
| 15 / 22 | 沿用 `AGENTS.md` 通用鐵則 | ✅ |
| 16 DoD | grep 呼叫端 ＋ FMEA（R17）＋ 使用手冊節（後台上架操作） | ✅ |
| 17 CI | 「出貨前會跑的那一組」＝ `pnpm check`（lint、format、type-check、depcruise、guards 自我測試、guards、test、build）＋ `pnpm test:e2e`。CI 平台建議 GitHub Actions，跑同一組指令 | ✅ 清單；CI ⏳ 等 git remote |
| 18 錯誤訊息 | 給使用者的句子和 API `code` 分開；fallback 回通用句，不回原文 | ✅ |
| 19 語言 | 回覆用繁體中文；程式碼、識別字、commit 用英文 | ✅ |
| 20 授權邊界 | 改 code、commit、本地實驗自己做；**每次 `git push` 都問**；prod 由人手動（R10）；真的對外寄信／通知之前先問 | ✅ |
| 21 檔位 | **Mode B**（§1.4）。研究可以推翻產品裁定，不能推翻安全底線；**法規解讀一律 🔒，送律師或衛生局** | ✅ |
| 23 索引 | 本檔只當索引。權威來源：法規看 `docs/research/`，資安看 `security-baseline.md`，效能看 `performance-baseline.md`；引用數字前先開權威檔 | ✅ |
| 24 pitfall | memory／pitfall 一律寫成可以重跑的判別法 | ✅ |

---

## 1. 不可違反的鐵則

### 1.1 一般開發

| 規則 | 說明 |
|---|---|
| **R1** | 任何破壞性修改（DB schema、API 介面）**必須先寫遷移計畫**，PR 描述中說明影響範圍 |
| **R2** | 安全敏感模組（認證、權限、審計、計費）**必須有單元測試 + 整合測試**，覆蓋率 > 80% |
| **R3** | **不可在程式碼中硬編 secret**（API key、密碼、token）。一律走環境變數或 secret manager |
| **R4** | 涉及 SQL 執行的功能**必須走 prepared statement**，禁止字串拼接 |
| **R5** | 所有寫入操作**必須記錄 audit log**，包含 actor、action、target、timestamp、result |

### 1.2 Claude Code 行為

| 規則 | 說明 |
|---|---|
| **R6** | Claude Code **不得自行決定架構**。重要設計（資料模型、API 介面、狀態機）**必須先寫設計文件、由人 review 後再實作**（用 `docs/modules/<module>.md` 模板）|
| **R7** | Claude Code 在不確定時**必須停下來問**，不可猜測。例外：使用者明確說「全部由你決定」時，可在已宣告的範圍內裁定。⚠️ **execution 檔位是開工前的決定**（`docs/pre-dev-decisions.md` §四）——成熟後常演化成「研究錨定的建議＝已核准，一氣呵成」；但研究能推翻的是產品裁定，**不能推翻安全底線與不可逆動作的確認義務** |
| **R8** | **每個 task 完成後必須跑完整測試 + lint + build**，全綠才算完成 |
| **R9** | **不得使用 `--no-verify` 跳過 git hook**；不得用 `git push -f` 推 main 分支 |
| **R10** | 涉及生產環境的任何操作（部署、執行 SQL、資料變更）**必須由人手動執行**，Claude Code 只能產生指令，不能直接執行 |
| **R17** | **功能標「完成」或上 prod 前，必須產出 FMEA 失效場景反思** — 逐路徑（每個入口 / 外呼 / 狀態轉換 / 並發點 / 部署順序）列「失效模式 → 影響 → 嚴重度（P0/P1/P2）→ 緩解狀態（✅/⚠️ 殘留/🔒 外部 gate）」，寫進 design doc 固定章節（範本見 `docs/modules/_template.md`「失效場景反思（FMEA）」段）。**任一 P0 未緩解不得上 prod**；已知殘留也要列（為何可忍 + 治本方向）。無 design doc 的小改動 / hotfix 至少在回報中口頭列失效場景 + 緩解。心態 = pre-mortem（假設它已壞，反推為什麼），不是只測 happy path |

| **R18** | **資安基線第一天生效**：`docs/security-baseline.md` 全文是 P0 —— 注入面（值參數綁定、動態 identifier 白名單）、deny-by-default + object-level authz、JWT 硬化、**AI/LLM 載重不變量**（授權絕不由模型決定）、SSRF、secret redact、金額 decimal、audit 不可變、供應鏈門檻、CI gates。開工先寫 §0 威脅模型前三名。**測試不得用特權連線遮蔽安全機制**（superuser 讓 RLS/grant 不執法，少一條 grant 也是綠的） |

| **R19** | **前端改動的驗證迴圈**：`docs/frontend-testing.md` —— 用 Playwright 驅動**真實瀏覽器**走使用者流程（讀 a11y tree / DOM 為主），**在瀏覽器實際用過才算完成**；走通的流程**固化成 spec 進 CI**（AI 驅動只做探索不進 CI）；spec 要真的綠過一次再 commit。「渲染出來了」≠「操作得動」——schema / 渲染 / 可操作是三層 |

| **R20** | **效能地板第一天生效**：`docs/performance-baseline.md` 是 `security-baseline.md` 的雙生檔，同樣與技術棧無關 —— 量測先行（**量測腳本自己會錯而且是安靜的**，自檢要陽性＋陰性對照組）、N+1 與 query 數 assert、禁無上限查詢 / fan-out / 佇列、**每個外呼都要有 timeout**（多數 client 預設是無限等）、請求總預算、**快取 key 必須含租戶維度**（少一維不是效能問題是跨租戶洩漏）、只回需要欄位、重計算進背景、**連線池上限 × 實例數 < DB 上限**。開工先寫 §0 三個數字（p95 目標 / payload 上限 / 單請求外呼次數上限）並讓它們進 CI 門檻 |

| **R21** | **技術棧規則附件**：開工確認技術棧後（`docs/pre-dev-decisions.md` §一 #5），必須挑一份 `docs/stack-rules/<stack>.md` 生效 —— 它寫的是「兩塊地板在這個棧上長什麼樣」。沒有現成附件的棧，照 `docs/stack-rules/_generator.md` 的**固定 16 維度**生成、由人 review 後才生效（自由生成的規則沒有分母，等於沒查）。🔴 **每條規則必須寫得出執法點**（設定旗標 / lint 規則 / CI job / grep 守衛）；寫不出執法點的不准掛 P0，降級成 P2 慣例 —— 規則沒有檢查一定會漂。新增附件要**同一個 commit**加進 `setup.sh` 的 `STACK_FILES`，`scripts/check-docs-wired.sh` 會擋 |

> R17–R21 編在 §1.2（通用行為鐵則）而非 §1.3 —— 它們不依專案技術棧，不可砍。
> 其中 R18（資安）/ R20（效能）是兩塊**與棧無關的地板**，R21 是把地板落到**你這個棧**的那一層。

### 1.3 程式碼層硬規則（依專案技術棧調整）

> 這節是**專案自己的**硬規則，依專案技術棧改寫 / 增刪 / 全砍。下面是常見規則範例。
> ⚠️ 棧的通用規則不要抄進這裡 —— 那些在 `docs/stack-rules/<stack>.md`（R21）。
> 這節只放「這個專案特有、附件不會有」的那幾條。

| 規則 | 說明 |
|---|---|
| **R11** | **型錄不變量**（2026-10-31 定位改為中古設備買賣後修訂）：①前台**沒有任何下單、付款、購物車路徑**，只能詢價（MVP 範圍，用戶裁定）；②後台文案欄位擋療效字詞（醫材法 §3 以療效定義醫療器材、§6 定義醫材廣告；關鍵字守衛，送出時警告並寫 audit）；③醫療器材許可證字號是**選填屬性**，只勾給醫療類分類，有值才在商品頁顯示（2026-11-01 起商品欄位由後台定義，site-config.md §4.1）。執法點：grep 守衛擋 `checkout\|cart\|payment` 路由 + `src/modules/catalog/efficacy-words.ts` 單元測試 |
| **R12** | **單語 zh-TW，不上 i18n 框架**：買方都在台灣，法規要求的揭露文字是中文。UI 文案集中在 `src/copy/`，不散落在元件裡，以後要多語時才有遷移起點 |
| **R13** | **Component spacing**：button group / form group 一律用 antd `<Flex gap>` / `<Space>`，元件裡禁止用 inline `style` 的 margin 做間距。執法點：`scripts/guards/no-inline-margin.sh` |
| **R14** | **新代碼框架**：一律放在同一個 Next.js App Router app 裡，Server Component 優先；不另外開 SPA 或獨立後端服務 |
| **R15** | **出貨前清單**：solo 直接 commit，不走 PR（memory `feedback_no_pr_workflow`）。每個功能標「完成」前必須走過 `docs/pre-pr-checklist.md` |
| **R16** | **前端設計鐵則**：所有前端產出必過 `docs/frontend-design-principles.md` **§A 普世核心**（token、a11y、全狀態、響應式、複用、文案）+ **§C 設計流程迴圈**。🔴 **§B 美學 profile 於開工時決定**（見 `docs/pre-dev-decisions.md` §二）——profile 的正確來源是**目標使用者的母心智模型與競品實測**，不是預設鎖一個名字（2026-09 更新：前一版鎖 `modern-SaaS-craft`，在一個 B2B 表單專案被實戰推翻 —— 那個 profile 與使用者要的「紙的形狀」全面相反）。定了之後 Claude Code 不得自行換；要換由人改本鐵則並說明理由。**本專案**：2026-10-31 用戶說「前端視覺設計不限制」，Claude 先選了 `spec-catalog`；經 16 站版面量測、86 站美工分析和多輪 mockup，**用戶 2026-11-01 裁定「視覺設計風格採用 site-v5-1」**，profile 改為 **`inspect-catalog`「實機型錄」**：首屏實拍照片＋唯一一個搜尋、藍＋橘（橘只用在價格、主要行動、新到）、圓角 6px、商品卡欄位固定、設備銘牌＋規格表、插畫只用在小尺度。規則與執法點在 `frontend-design-principles.md` §B0。後台只能調主色、重點色、圓角（site-config.md §4.3，存檔時檢查對比），其餘 §B0 規則不能從後台改 |

### 1.4 執行模式（autonomy level）

> 用戶在啟動 Claude Code 時可選兩種執行模式之一：

**Mode A — 互動模式（預設）**：
- 每個高風險動作前確認（重啟 / 動 prod / 大範圍刪除）
- 適合：新專案探索期、不熟領域、需共同決策
- 對應 feedback：`feedback_single_task_execution.md`

**Mode B — 企業級自主模式**：
- 啟動指令：`claude --dangerously-skip-permissions`
- 含意：用戶**主動移除摩擦** + **要求加深度**（不是降低標準）
- 行為調整：
  - 平行 Agent / 背景 Monitor / 試錯 repro 不再每次問
  - 每個 commit 主動跑 cross-cutting checks（security / observability / cost / compat 四檢，見 `memory/rule_cross_cutting_checks.md`）
  - design doc 範本擴 §安全模型 / §容量 / §失效 / §觀測 / §成本 / §兼容 六大章節
  - Trade-off 主動 surface（不等用戶問就告知影響）
- **仍會停下來的情境**：架構選擇 / 砍-留決策 / business logic 模糊 / `git push -f` 等不可逆操作
- 對應 feedback：`feedback_enterprise_execution.md`

> 用戶於對話開頭明說「企業級」/「商用系統」/「production-grade」即切到 Mode B。

> **本專案：Mode B 生效**（2026-10-31；session 帶 bypass-permissions 啟動，用戶沒有異議）。

---

## 2. 技術棧

> 版本以 scaffold 後的鎖檔為準，這裡不寫版本號，免得跟鎖檔對不上。

### 2.0 評估留痕（pre-dev #5）

| 選項 | 優 | 劣 | 裁定 |
|---|---|---|---|
| **Next.js + Postgres** | 用戶最熟（asmo、Dominai 用同一套棧：Next.js + Prisma + NextAuth + Tailwind）；型錄用 SSR 做 SEO；前台後台同一個 repo | 框架預設值的陷阱多（快取、Server Action 其實是公開 POST 端點），靠 R21 棧規則附件擋 | ✅ 用戶 2026-10-31 選定 |
| Astro + headless CMS | 型錄最快、SEO 最好 | 後台要靠 CMS，詢價和上架流程要另外接，還多一個供應商 | ✗ |
| WordPress + WooCommerce | 上線最快 | PHP 外掛的供應鏈風險高，資安和效能基線很難執行到位 | ✗ |

### 2.1 後端
- TypeScript，Next.js Route Handler / Server Action（後台 mutation 一律經過單一 authz 入口）
- PostgreSQL；不上 cache 或 queue，等量到有需要再決定（R20 先量測）
- Prisma（schema 在 `prisma/schema.prisma`，migration 在 `prisma/migrations/`）
- next-auth 4（stable；Auth.js v5 仍是 beta）：只給後台員工登入，前台沒有會員；Google provider＋email 白名單

### 2.2 前端
- Next.js App Router（Server Component 優先）
- **Ant Design 6**（用戶 2026-10-31 指定）＋ `@ant-design/nextjs-registry`（SSR 樣式）。**不使用 Tailwind**：antd 有自己的 token 與 CSS-in-JS，兩者並用時 preflight 會互相打架
- token 的單一權威是 `src/theme/tokens.ts`（餵給 `ConfigProvider`），profile 見 `frontend-design-principles.md` §B0
- 狀態：URL search params（篩選、分頁）＋ server state，不上全域 state 函式庫

### 2.3 工具
- **pnpm**（不可混用 npm；理由：pnpm 預設不跑相依套件的 install script，對應 security-baseline 的供應鏈門檻）
- ESLint + Prettier · `tsc --noEmit` · Vitest · testcontainers · Playwright · dependency-cruiser
- 供應鏈：`pnpm-workspace.yaml` 設 `minimumReleaseAge: 10080`（拒裝發佈未滿 7 天的版本）＋ 相依套件的 install script 預設不跑

### 2.4 未決（何時回來）
| 項目 | 何時回來 |
|---|---|
| 部署平台（Vercel+Neon / Cloudflare / 自架） | 上線前一個 milestone |
| 商品圖片儲存（object storage，與主網域分開） | 跟部署平台一起決定；開發期先放本機 |
| 寄信服務（詢價通知） | MVP 先只寫進 DB、後台查看；要通知時再定 |
| CI 平台 | remote 已建（GitHub private）；GitHub Actions 跑 `pnpm check` + `pnpm test:e2e` 待做（§0.2 #17） |
| mockup 分享站 | 用戶 2026-10-31 要部署到 Render 給別人看（`ENABLE_MOCKUPS=1`）；部署由用戶操作（R10） |

---

## 3. 開發流程

詳細指令見 `AGENTS.md`。scaffold 時用下面這些 script 名稱：

```bash
pnpm i
pnpm dev
pnpm fix          # eslint --fix + prettier --write
pnpm lint         # 重複跑直到 0 issues
pnpm type-check
pnpm test         # Vitest（單元＋整合，整合用 testcontainers）
pnpm test:e2e     # Playwright
pnpm build
pnpm depcruise
pnpm audit --prod
pnpm guards               # grep 守衛（scripts/guards/rules.sh）；改守衛先跑 pnpm guards:selftest
pnpm check                # 出貨前那一組（不含 e2e）
pnpm prisma migrate dev   # 改 schema 後；generated client（src/generated/）不 commit
```

每個 task 完成後（R8）：

1. **format** modified files
2. **lint** — 重複跑直到 0 issues
3. **build / test**
4. 涉及 Prisma schema：migrate + 確認 migration SQL（R1）
5. 涉及 frontend：fix + type-check + test + Playwright 走一次（R19）

---

## 4. 程式碼目錄結構（scaffold 時建立）

```
Asclepia/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (public)/            ← 前台型錄、商品頁、詢價
│   │   └── admin/               ← 後台（全部經 requireAdmin）
│   ├── modules/<domain>/        ← catalog / inquiry / admin-auth / audit（depcruise 擋跨模組 deep import）
│   ├── copy/                    ← UI 文案（R12）
│   └── theme/tokens.ts           ← antd token 單一權威
├── e2e/                         ← Playwright spec
├── docs/
│   ├── research/                ← 法規與競品研究（附出處＋查證日）
│   ├── modules/<module>.md      ← 模組設計（R6）
│   ├── mockups/
│   └── stack-rules/nextjs-prisma-antd.md
├── CLAUDE.md  AGENTS.md  README.md
```

---

## 5. 與 Claude Code 協作

### 5.1 任務啟動流程
1. 讀完 `CLAUDE.md`（本檔）+ `AGENTS.md`
2. 讀對應模組 `docs/modules/<module>.md`（如有）
3. `git status` 確認在乾淨分支
4. 確認測試環境可正常啟動

### 5.2 任務拆解粒度

**原則**：一個 task 應**一個檔案內 + 改動 < 200 行 + 單一 commit**。複雜功能拆多 task 串接。

模組級任務按 **M0 → M1 → M2 → M3 → M4** 切：
- **M0**：寫 design doc，列開放問題（OQ-XYZ-N），等用戶裁定
- **M1–M3**：實作各 sub-task，每個 milestone 一個 commit
- **M4**：docs 收尾 + MODULES.md 標 ✅

### 5.3 何時必須停下來問

| 情境 | 為什麼 |
|---|---|
| 需要修改現有共用模組 | 影響範圍大，可能破壞其他模組 |
| 需要新增 DB schema 或 migration | 影響面廣，需設計 review |
| 需要繞過或停用既有測試 | 通常表示測試發現真實問題 |
| 業務邏輯模糊 | 領域知識需 DBA / domain expert 主導 |
| 需要新增第三方依賴 | 影響供應鏈安全 |
| 大規模重新命名 / 刪除 | 不可逆操作，需明確授權 |

### 5.4 PR 規範

PR 標題：`<type>(<scope>): <description>`（例 `feat(risk): add CEL evaluator`、`fix(audit): handle nil ctx`）。

PR 內容必含：目的、變更內容、測試結果、影響範圍。

---

## 6. Quick Reference

| 用途 | 路徑 |
|---|---|
| 本主指引 | `CLAUDE.md` |
| Dev workflow 細節 | `AGENTS.md` |
| 模組詳細設計 | `docs/modules/<module>.md` |
| Pre-PR Checklist | `docs/pre-pr-checklist.md` |
| Cleanup 收斂規劃 | `docs/cleanup-plan.md` |
| 前端設計原則（核心 + 美學 profile） | `docs/frontend-design-principles.md` |
| 前端驗證迴圈（真實瀏覽器） | `docs/frontend-testing.md` |
| 開工前決策清單（25 格） | `docs/pre-dev-decisions.md` |
| 資安地板（P0，與棧無關） | `docs/security-baseline.md` |
| 效能地板（與棧無關） | `docs/performance-baseline.md` |
| 技術棧規則附件 | `docs/stack-rules/<stack>.md` |
| 沒有現成附件時的生成器規格 | `docs/stack-rules/_generator.md` |
| 參考站與醫材法規研究（逐字＋出處＋查證日） | `docs/research/2026-10-31-reference-and-regulation.md` |

---

## 附錄：本文件變更紀錄

| 日期 | 版本 | 變更 | 作者 |
|---|---|---|---|
| 2026-10-31 | v1.0 | 初版：走過 pre-dev 25 格，填入定位、棧、合規不變量（R11）、profile（R16）、執行模式 | Claude Code（與用戶逐格裁定） |
| 2026-10-31 | v1.1 | 用戶改定位：「當作中古器材買賣就行，我賣的是設備，不是『醫療』器材」。§0／§0.1／R11／R16 改寫；許可證字號改選填；法規邊界移到 research §5 | Claude Code（依用戶指示） |
| 2026-11-01 | v1.2 | 用戶定案視覺：「視覺設計風格採用 site-v5-1」。R16 與 §0.2 #13 的 profile 由 `spec-catalog` 改為 `inspect-catalog`「實機型錄」 | Claude Code（依用戶指示） |
| 2026-11-01 | v1.3 | 用戶裁定後台可設定（形態 C）、任何商品都要能用：§0.1 MVP、R11③、R16 補後台可調範圍；新增 inquiry.md、site-config.md（皆 APPROVED） | Claude Code（依用戶指示） |

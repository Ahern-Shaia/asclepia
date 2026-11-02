# deploy.md — 正式環境部署設計（Vercel ＋ Neon ＋ Cloudflare R2）

> 📝 **狀態：DRAFT（2026-11-02）**。用戶 2026-11-02 選定：網站 Vercel、資料庫 Neon、圖片 Cloudflare R2。
> §6 的開放問題由用戶裁定後改為 APPROVED，才開始改程式（R6）。部署動作一律由人執行（R10），本檔只寫步驟。

## 1. 架構

| 角色 | 服務 | 方案 | 為什麼 |
|---|---|---|---|
| 網站（Next.js） | Vercel | **Pro**（每月 20 美元） | Hobby 條款只限個人、非商業用途；本站是公司網站 |
| 資料庫 | Neon Postgres | Free（每專案每月 100 CU-小時；閒置 5 分鐘暫停） | 量小時夠用；暫停後第一個請求會慢一點 |
| 圖片 | Cloudflare R2 | Free（10 GB、流量不計費） | 與主網域分開（security-baseline §0 #2），流量免費 |

查證日 2026-11-02，出處見 §7。價格與額度會變，上線前再看一次官方頁。

## 2. 平台限制對程式的影響

| 限制 | 影響 | 做法 |
|---|---|---|
| Vercel Function 請求本體上限 **4.5 MB**（超過回 413，不能調） | 後台上傳目前收 15 MB 原圖；手機照片常 3–8 MB，會直接失敗 | **瀏覽器先縮圖**：上傳前在後台用 canvas 把長邊縮到 2400 px、轉成 JPEG（通常 1–2 MB）；伺服器照舊用 sharp 重新壓縮、去 EXIF（消毒仍在伺服器）。伺服器上限改成 4 MB，超過回清楚的句子 |
| Vercel 沒有可長期保存的硬碟 | 照片目前寫在本機 `.uploads/` | 儲存改成可切換：開發與 e2e 用本機硬碟，正式環境用 R2（S3 相容 API）。由環境變數決定 |
| R2 的 `r2.dev` 網址官方說**不可用於正式環境**（會限流） | 照片網址要用自己的網域 | R2 綁自訂網域，例如 `img.<你的網域>`；**需要網域由 Cloudflare 管 DNS**（§6 OQ-DEP-2） |
| 照片改由 R2 網域直接提供 | `/media/[file]` 路由只剩開發用 | 照片網址改由一個函式產生（開發：`/media/…`；正式：`https://img.<網域>/…`）。現有程式組網址的地方都改用它 |
| Neon 有直連與 pooler 兩種連線 | migration 需要直連；網站在 serverless 下要用 pooler | `MIGRATE_DATABASE_URL` 用直連（owner），`DATABASE_URL` 用 pooler（`asclepia_app`）。連線池上限 `DB_POOL_MAX` 設 1–2（每個函式實例一個小池） |
| P5-2「池 × 實例數 + 保留 < 上限」在 serverless 實例數無上限 | 公式的「實例數」無法固定 | 改用 pooler 的連線上限當 `DB_MAX_CONNECTIONS`，`DEPLOY_MAX_INSTANCES` 設 Vercel 專案的並行上限。⏳ 數字上線前依 Neon 方案頁填 |
| Vercel Cron 以 GET ＋ `Authorization: Bearer $CRON_SECRET` 呼叫 | 每日清除端點已支援 GET 與 Bearer | 加 `vercel.json` 的 `crons`（每日一次）。Vercel 不會重試失敗的排程，看 Cron Jobs 頁的紀錄 |
| 用戶端 IP header | 限流以 IP 為鍵 | Vercel 會設定 `x-forwarded-for`；⏳ 上線前確認 Vercel 是否覆寫用戶自帶的值（若不覆寫改用 `x-real-ip`） |
| sharp | Vercel 的 Node 函式可執行 sharp | 不需改。Cloudflare Workers 不能跑 sharp，所以網站不放 Workers |

## 3. 程式要改的地方（APPROVED 後才做）

1. `src/server/images/storage.ts`：介面不變（put／remove／url），實作分成本機與 R2 兩種，`STORAGE_DRIVER=local|r2` 選擇；R2 用 S3 API 上傳與刪除（需要簽章，見 OQ-DEP-3）。
2. 照片網址集中由 `mediaUrl()` 產生（`MEDIA_BASE_URL`），取代散在各處的 `/media/${…}`。
3. 後台三個上傳入口（商品照片、站台圖片、分類圖示）上傳前在瀏覽器縮圖；伺服器上限改 4 MB。
4. `vercel.json`：每日排程。
5. `src/server/env.ts`：新增 R2 與媒體網址的環境變數，缺漏時只回報 key 名。
6. e2e 仍用本機儲存；R2 驅動用整合測試（假的 S3 伺服器或錄製請求）驗證簽章與網址。

## 4. 環境變數（正式環境，由人填在 Vercel）

`DATABASE_URL`（Neon pooler、asclepia_app）· `MIGRATE_DATABASE_URL`（只在本機執行 migration 時用，不放 Vercel）· `NEXTAUTH_URL` · `NEXTAUTH_SECRET` · `GOOGLE_CLIENT_ID` · `GOOGLE_CLIENT_SECRET` · `ADMIN_EMAILS` · `RATE_LIMIT_SECRET` · `CRON_SECRET` · `STORAGE_DRIVER=r2` · `R2_ACCOUNT_ID` · `R2_ACCESS_KEY_ID` · `R2_SECRET_ACCESS_KEY` · `R2_BUCKET` · `MEDIA_BASE_URL` · `DB_POOL_MAX` · `DEPLOY_MAX_INSTANCES` · `DB_MAX_CONNECTIONS`

## 5. 上線步驟（人執行，R10）

1. 網域：在 Cloudflare 管 DNS（OQ-DEP-2）。
2. Neon：建專案 → 取得直連與 pooler 連線字串。本機執行 `prisma migrate deploy`（直連、owner）→ `psql -f prisma/sql/roles.sql`（建立 `asclepia_app`）。
3. R2：建 bucket → 綁 `img.<網域>` → 建只限這個 bucket 的 API token。
4. Google OAuth：新增正式網址的授權來源與 redirect URI。
5. Vercel：匯入 GitHub repo、選 Pro、填 §4 環境變數、綁網域、部署。
6. 部署後 smoke：首頁、商品頁、後台登入、上傳一張照片、送一筆測試詢價後刪除、手動呼叫一次 `/api/cron/daily` 確認 200。

## 6. 開放問題（OQ-DEP-N）

| # | 問題 | 選項 | 建議 |
|---|---|---|---|
| **OQ-DEP-1** | Vercel Pro 每月 20 美元 | 接受 · 改用允許商業用途的平台 | 接受（用戶已選 Vercel；Hobby 不能商用） |
| **OQ-DEP-2** | 網域 | 已有、可交給 Cloudflare 管 DNS · 已有、不想搬 · 還沒有 | 由 Cloudflare 管 DNS：R2 自訂網域需要。不搬的話照片只能經過網站轉送，流量算在 Vercel |
| **OQ-DEP-3** | R2 上傳要做 S3 簽章 | A. `aws4fetch`（小型、零相依）· B. 官方 `@aws-sdk/client-s3`（大）· C. 自己寫 SigV4 | A：一個小函式庫、容易審；B 體積大、相依多；C 自己寫簽章容易錯。新增相依前讀 LICENSE 本文、`pnpm audit`（CLAUDE.md §0.2 #7） |

## 7. 出處（查證日 2026-11-02）

- Vercel Hobby 限非商業：https://vercel.com/docs/plans/hobby
- Vercel Function 4.5 MB 上限：https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions
- Vercel Cron 與 CRON_SECRET：https://vercel.com/docs/cron-jobs/manage-cron-jobs
- Neon Free 額度：https://neon.com/faqs/free-plan-limits-and-quotas
- Neon 以 SQL 建立的角色需逐條授權：https://neon.com/docs/manage/roles/
- R2 `r2.dev` 不可用於正式環境：https://developers.cloudflare.com/r2/platform/limits/
- R2 免費額度（第三方整理，官方頁待覆核）：https://upstash.com/kb/cloudflare-r2-pricing-in-2026-storage-operations-and-real-monthly-bills

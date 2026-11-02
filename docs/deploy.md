# deploy.md — 正式環境部署設計（Render ＋ Neon）

> ✅ **狀態：APPROVED（2026-11-02）**。用戶裁定：網站放 Render Starter（新加坡）＋永久硬碟存照片，
> 資料庫用 Neon Free（新加坡，Postgres 18）；開發與測試同步升到 Postgres 18。
> 先前的 Vercel ＋ R2 草稿作廢：Vercel Hobby 條款不允許商業用途（本站為公司銷售設備而設，屬「為參與者帶來經濟利益」），
> Pro 每月 20 美元；R2 正式使用需要自有網域，目前還沒有。
> 部署動作一律由人執行（R10），本檔只寫步驟。

## 1. 架構

| 角色 | 服務 | 方案 | 說明 |
|---|---|---|---|
| 網站（Next.js，`next start`） | Render Web Service | **Starter**（0.5 CPU／512 MB，約每月 7 美元），新加坡 | 常駐伺服器：沒有 serverless 的 4.5 MB 上傳上限，sharp 可直接執行 |
| 照片 | Render Persistent Disk（掛在網站上） | 2–5 GB（每 GB 每月 0.25 美元） | 照片照舊寫本機硬碟（`UPLOAD_DIR` 指向掛載點），程式不用改 |
| 資料庫 | Neon（專案 `Asclepia`、分支 `production`） | Free，新加坡，Postgres 18 | 閒置 5 分鐘暫停，下一個請求會慢一點；歷史還原只有 6 小時（§4） |
| 每日清除排程 | GitHub Actions 定時工作 | 免費 | 每天呼叫 `/api/cron/daily`（`.github/workflows/daily.yml`） |

網址先用 Render 提供的 `<服務名>.onrender.com`，之後有網域再綁。價格查證日 2026-11-02（第三方整理），下單前看 Render 官方價格頁。

## 2. 平台特性與對策

| 特性 | 影響 | 對策 |
|---|---|---|
| 掛了硬碟的服務**只能跑一台**，部署時先停舊的再起新的 | 每次部署有幾秒連不上；不能水平擴充 | 量小可接受；部署挑離峰時間 |
| 硬碟在 build 階段讀不到 | build 不能讀照片 | build 不需要照片；只有執行時寫入 |
| 硬碟每 24 小時自動快照，至少保留 7 天，可整顆還原 | 照片有基本備份 | 還原會蓋掉快照之後的所有變更（例如之後上傳的照片） |
| Render 只在 `X-Forwarded-For` **後面附加**，不清除用戶自帶的值 | 限流以 IP 為鍵，第一個值可被偽造 → 詢價防洗版可被繞過 | ⏳ 上線後用一次真實請求確認 header 結構，再決定讀哪一段（`CLIENT_IP_HEADER` 與讀取位置）；在那之前是已知缺口（`src/server/env.ts` 已註明） |
| Neon 有直連與 pooler 兩種連線字串 | migration 需要直連 | 網站用 pooler（`asclepia_app`），migration 用直連（`neondb_owner`）。單一實例：`DEPLOY_MAX_INSTANCES=1`、`DB_POOL_MAX=5` |
| Neon 預設擁有者是 `neondb_owner`，資料庫叫 `neondb` | `prisma/sql/roles.sql` 以 `current_database()` 授權，不寫死名稱 | 不用改；以擁有者身分執行即可建立 `asclepia_app` |
| Postgres 18 | 本機與測試原本是 16 | 已升級：`compose.yaml`、`src/test/global-setup.ts` 都是 `postgres:18.4-alpine`；`src/server/db.int.test.ts` 斷言主版本是 18 |

## 3. 環境變數（填在 Render 服務的 Environment；不進 git、不貼到對話）

| 變數 | 值 |
|---|---|
| `DATABASE_URL` | Neon **pooler** 連線字串，帳號 `asclepia_app`（§5 步驟 2 設的密碼） |
| `NEXTAUTH_URL` | `https://<服務名>.onrender.com` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID`／`GOOGLE_CLIENT_SECRET` | Google Cloud 主控台（同一組可沿用，但要加正式網址，§5 步驟 4） |
| `ADMIN_EMAILS` | 可以進後台的 Google 帳號，逗號分隔 |
| `RATE_LIMIT_SECRET` | `openssl rand -base64 32` |
| `CRON_SECRET` | `openssl rand -base64 32`（GitHub 那邊要填同一個值） |
| `UPLOAD_DIR` | 硬碟掛載點底下的資料夾，例如 `/var/data/uploads` |
| `DB_POOL_MAX`／`DEPLOY_MAX_INSTANCES`／`DB_MAX_CONNECTIONS` | `5`／`1`／Neon pooler 的連線上限（⏳ 依 Neon 文件填） |
| `NODE_VERSION` | `24` |

`MIGRATE_DATABASE_URL`（直連、擁有者）**不放 Render**，只在你自己的電腦執行 migration 時臨時設定。

## 4. 備份

| 資料 | 現況 | 缺口 |
|---|---|---|
| 照片 | Render 硬碟每日快照，至少 7 天 | — |
| 資料庫 | Neon Free 只能還原到 **6 小時內** | ⏳ **上線前要決定**：A. 每週手動 `pg_dump` 存到自己的電腦（免費，靠人記得）· B. 升級 Neon 付費方案取得較長的還原期 · C. 排程自動備份到另一個地方（要另選存放處；備份含詢價個資） |

## 5. 步驟（人執行，R10）

### 本機升級到 Postgres 18（只做一次）
舊的 16 版資料留在原本的 `asclepia-db` 儲存區，不會被刪；確認新版正常後再自行刪除。
```bash
docker compose exec -T db pg_dump -U asclepia_owner -d asclepia -Fc > ~/asclepia-dev-pg16.dump  # 1. 先匯出（舊容器還在跑）
docker compose up -d --wait                                                                    # 2. 換成 18、新儲存區
docker compose exec -T db pg_restore -U asclepia_owner -d asclepia --no-owner < ~/asclepia-dev-pg16.dump  # 3. 匯入
pnpm db:setup                                                                                  # 4. 補 migration 與權限
```
步驟 3 若出現 `schema "public" already exists` 之類的訊息可以忽略（新資料庫已經有這個 schema）；其他錯誤先停下來。
之後重開 `pnpm dev`。e2e 用的 `asclepia_e2e` 會在下次跑 e2e 時自動重建。

### 上線
1. **Neon**（已建立）：Connect → 取得直連與 pooler 兩種字串。
2. **資料表與權限**（在你的終端機，**不要用 `!`**，指令裡有密碼）：
   ```bash
   MIGRATE_DATABASE_URL='<直連字串>' pnpm exec prisma migrate deploy
   psql '<直連字串>' -v app_password='<新的 app 密碼>' -f prisma/sql/roles.sql
   ```
   `DATABASE_URL` 就是 pooler 字串，帳號密碼換成 `asclepia_app` 與上面設的密碼。
3. **Render**：New → Web Service → 連 GitHub repo `asclepia`、分支 `main`、Region Singapore、Instance Starter。
   Build：`corepack enable && pnpm install --frozen-lockfile && pnpm build` · Start：`pnpm start`（Render 會給 `PORT`）。
   Disks：新增，掛載點 `/var/data`，2–5 GB。Environment：§3。
4. **Google OAuth**：授權的 JavaScript 來源加 `https://<服務名>.onrender.com`，重新導向 URI 加 `https://<服務名>.onrender.com/api/auth/callback/google`。
5. **GitHub**：repo Settings → Secrets and variables → Actions：Secret `CRON_SECRET`（同 §3）、Variable `SITE_URL`（`https://<服務名>.onrender.com`）。設好後每日清除排程才會真的呼叫。
6. **部署後 smoke**：首頁、商品頁、後台登入、站台設定填電話、上傳一張照片並在前台看到、送一筆測試詢價後在後台刪除、GitHub Actions 手動執行 daily 工作一次確認成功。

## 6. 開放問題

| # | 問題 | 狀態 |
|---|---|---|
| OQ-DEP-1 | 網站平台 | ✅ Render Starter ＋硬碟（用戶 2026-11-02） |
| OQ-DEP-2 | 網域 | 還沒有；先用 `onrender.com`，之後再綁 |
| OQ-DEP-3 | 資料庫備份（§4） | ⏳ 上線前決定 |
| OQ-DEP-4 | 用戶端 IP 的讀法（§2） | ⏳ 上線後實測 |

## 7. 出處（查證日 2026-11-02）

- Vercel 商業用途定義：https://vercel.com/docs/limits/fair-use-guidelines
- Render 免費方案限制：https://render.com/docs/free
- Render 永久硬碟（單一實例、部署停機、每日快照）：https://render.com/docs/disks
- Render 價格（第三方整理）：https://temps.sh/blog/render-pricing-2026 · https://kuberns.com/blogs/render-pricing/
- Render `X-Forwarded-For` 只附加不清除（社群回報）：https://feedback.render.com/features/p/send-the-correct-xforwardedfor · https://community.render.com/t/accessing-client-ips-in-a-node-express-app/36282
- Neon Free 額度：https://neon.com/faqs/free-plan-limits-and-quotas
- Neon 物件儲存僅限 us-east-2、Beta：https://neon.com/docs/storage/buckets
- Neon 以 SQL 建立的角色需逐條授權：https://neon.com/docs/manage/roles/

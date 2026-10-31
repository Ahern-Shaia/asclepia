# 技術棧規則附件:Next.js 16 + Prisma 7 + antd 6(`nextjs-prisma-antd`)

> **狀態**|⏳ 生成物(依 `_generator.md` 產出,2026-10-31),**人 review 後才生效**。
> **本檔只寫「兩塊地板在這個棧上長什麼樣」**;地板本身看 `security-baseline.md` / `performance-baseline.md`(含兩份的本專案 §0),這裡不重述。
> 規則編號 `S1-1`…`P8-3` 與檔尾〈CI-fail 禁令清單〉一一對應。出處代號(`[N1]` 等)見〈來源與查證狀態〉。

## 驗收

| 維度 | 結論 | 執法點 |
|---|---|---|
| S1 注入 | ✅ 規則 ×3(P0 ×2 / P1 ×1);`$queryRaw` 只收 tagged template,由型別內建涵蓋 | eslint `no-restricted-properties` + `no-restricted-syntax`(computed key)· 整合測試 |
| S2 反序列化 / 動態求值 | ✅ 規則 ×3(P0 ×3);RSC Flight 反序列化屬框架層,由 S7 audit 門檻涵蓋 | eslint `no-eval` / `no-implied-eval` / `no-new-func` / `react/no-danger` · `guards/sharp.sh` · 整合測試 |
| S3 輸入邊界 | ✅ 規則 ×6(P0 ×4 / P1 ×2) | `guards/server-actions.sh` · eslint `no-restricted-syntax`(FormData 斷言)· `no-restricted-properties`(`process.env`) |
| S4 授權執法點 | ✅ 規則 ×7(P0 ×7) | `guards/admin-authz.sh` · e2e 重放 Server Action · 單元 / 整合測試 · 低權測試車道斷言 |
| S5 Secret 與設定 | ✅ 規則 ×5(P0 ×5) | `guards/env-public.sh` · `guards/next-config.sh` · `guards/bundle-secrets.sh` · `guards/db-boundary.sh` · gitleaks(需安裝) |
| S6 錯誤與日誌外洩 | ✅ 規則 ×4(P0 ×3 / P1 ×1) | `guards/error-leak.sh` · eslint `no-console` · e2e 跑 production build |
| S7 相依與供應鏈 | ✅ 規則 ×5(P0 ×4 / P1 ×1) | `pnpm install --frozen-lockfile` · `pnpm-workspace.yaml` 旗標 · `pnpm audit` 兩道 · `guards/licenses.sh` |
| S8 平台特有陷阱 | ✅ 規則 ×8(P0 ×6 / P1 ×2) | `guards/next-config.sh` · `guards/no-proxy.sh` · e2e 安全標頭 · 整合測試(上傳上限) |
| P1 N+1 與批次載入 | ✅ 規則 ×2(P0 ×1 / P1 ×1) | 整合測試 `expectMaxQueries`(附陽性對照) |
| P2 分頁與上限 | ✅ 規則 ×4(P0 ×2 / P1 ×2) | Prisma client extension + 整合測試 · eslint `no-restricted-syntax`(`skip`) |
| P3 逾時與取消 | ✅ 規則 ×5(P0 ×4 / P1 ×1);Google OAuth 外呼的逾時由 openid-client 內建(3500ms) | 整合測試(`pg_sleep`)· `guards/db-boundary.sh` · eslint `no-restricted-globals` · `guards/sharp.sh` |
| P4 並發模型與上限 | ✅ 規則 ×4(P0 ×4)+ P2 慣例 ×1 | eslint `no-restricted-syntax`(fan-out、`*Sync`)· `@typescript-eslint/no-floating-promises` · 整合測試 |
| P5 連線池與資源 | ✅ 規則 ×3(P0 ×2 / P1 ×1) | eslint `no-restricted-syntax`(`new PrismaClient/PrismaPg/Pool`)· env schema refine + 單元測試 |
| P6 記憶體與資料量 | ✅ 規則 ×3(P0 ×2 / P1 ×1) | 整合測試(上傳)· `guards/sharp.sh` · 整合測試(DTO 鍵) |
| P7 快取 | ✅ 規則 ×4(P0 ×3 / P1 ×1) | `guards/cache.sh` · e2e「下架後立即 404」 |
| P8 建置與啟動 | ✅ 規則 ×5(P0 ×2 / P1 ×3) | CI job 順序 · e2e bundle 預算 · `guards/prisma-config.sh` |

**驗收門檻自檢**:16 維全部有結論 · 每條 P0 都有可跑的執法指令(還沒接線的列在〈需要接線的執法點〉)· 每條 P0 都標了出處代號,出處與查證日在下一節 · CI-fail 清單與內文 P0 逐條對應(共 54 條;對帳:內文 `[P0]` 編號與清單編號 `diff` 為空)。

---

## 來源與查證狀態

**實際版本**(讀 `node_modules/<pkg>/package.json` 與 `pnpm-lock.yaml`,2026-10-31):
next 16.4.3 · react / react-dom 19.3.0 · typescript 5.9.3 · antd 6.6.7 · @ant-design/nextjs-registry 1.3.0(相依 @ant-design/cssinjs 2.1.2)· prisma / @prisma/client / @prisma/adapter-pg 7.10.1 · pg 8.23.1(pg-pool 3.14.0)· next-auth 4.24.15(相依 openid-client 5.7.1)· zod 4.6.7 · sharp 0.35.5 · vitest 5.0.5 · @playwright/test 1.64.1 · testcontainers 12.2.1 · dependency-cruiser 18.7.0 · eslint 9.39.5 · eslint-config-next 16.4.3 · pnpm 10.32.1。

| 代號 | 來源 | 查證日 |
|---|---|---|
| [N1] | `node_modules/next/dist/docs/01-app/02-guides/data-security.md`(DAL、`server-only`、Server Action 是公開 POST、閉包加密、`process.env` 只在 DAL、Auditing 清單) | 2026-10-31 |
| [N2] | `…/01-app/02-guides/server-actions.md`(§Security、§Deployment considerations) | 2026-10-31 |
| [N3] | `…/01-app/03-api-reference/05-config/01-next-config-js/serverActions.md`(`allowedOrigins`、`bodySizeLimit` 預設 1MB)· `node_modules/next/dist/server/config-shared.d.ts`(兩者都在 `experimental` 之下) | 2026-10-31 |
| [N4] | `…/03-api-reference/03-file-conventions/proxy.md` · `middleware.md`(Next 16 已 deprecated、改名 proxy)· `…/01-getting-started/16-proxy.md` | 2026-10-31 |
| [N5] | `…/05-config/01-next-config-js/proxyClientMaxBodySize.md`(預設 10MB,超過時「只緩衝到上限」) | 2026-10-31 |
| [N6] | `…/01-app/02-guides/environment-variables.md`(`NEXT_PUBLIC_` 在 build 時內聯)· `…/05-config/01-next-config-js/env.md`(`env` 鍵一律進 bundle) | 2026-10-31 |
| [N7] | `…/03-api-reference/01-directives/use-cache.md` · `use-cache-private.md` · `…/04-functions/cacheLife.md` · `updateTag.md` · `revalidateTag.md` · `…/01-getting-started/08-caching.md`(§Prerendering) | 2026-10-31 |
| [N8] | `…/01-app/02-guides/authentication.md`(§Layouts and auth checks)· `authentication-with-cache-components.md` | 2026-10-31 |
| [N9] | `…/03-api-reference/02-components/image.md`(§Configuration options)· `…/02-guides/upgrading/version-16.md`(images 預設變更、`revalidateTag` 第二參數) | 2026-10-31 |
| [N10] | `…/03-api-reference/03-file-conventions/error.md`(production 遮蔽 Server Component 錯誤)· `…/01-getting-started/10-error-handling.md` | 2026-10-31 |
| [N11] | `…/05-config/01-next-config-js/poweredByHeader.md` · `productionBrowserSourceMaps.md` · `headers.md` · `exposeTestingApiInProductionBuild.md` · `typescript.md` | 2026-10-31 |
| [N12] | `…/01-app/02-guides/content-security-policy.md`(nonce 需要動態渲染、與 PPR 不相容) | 2026-10-31 |
| [N13] | `…/03-api-reference/05-config/03-eslint.md` · `version-16.md`(移除 `next lint`;`next build` 不再跑 lint) | 2026-10-31 |
| [N14] | `…/05-config/01-next-config-js/cacheComponents.md` · `optimizePackageImports.md` · `…/02-guides/package-bundling.md` · `…/03-file-conventions/instrumentation.md` · `…/04-functions/after.md` · `…/02-route-segment-config/maxDuration.md` | 2026-10-31 |
| [P1] | https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries · `node_modules/@prisma/client/runtime/client.d.ts` L212–216、L1264–1271 | 2026-10-31 |
| [P2] | https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections/connection-pool · `@prisma/adapter-pg/dist/index.d.ts`(`PrismaPgOptions`)· `pg-pool/index.js`(`max` 預設 10、`idleTimeoutMillis` 預設 10000)· `pg/lib/defaults.js`(`statement_timeout` / `query_timeout` 預設 `false` = 無限) | 2026-10-31 |
| [P3] | `@prisma/config/dist/index.js` L529–565(`PRISMA7_CONFIG_FILE_CANDIDATES`、`loadConfigFromFile`) | 2026-10-31 |
| [A1] | https://ant.design/docs/react/use-with-next · `@ant-design/nextjs-registry/es/AntdRegistry.js` · `antd/es/config-provider/index.d.ts`(`csp`)· `antd/es/*/index.js`(80 個元件目錄有 79 個開頭是 `"use client"`)· `antd/es/table/InternalTable.js` L317–335(在瀏覽器端 slice `dataSource` 分頁) | 2026-10-31 |
| [NA1] | https://next-auth.js.org/configuration/callbacks · `/configuration/options` · `/configuration/nextjs` · `next-auth/core/init.js` L45(maxAge 30 天)、L66(沒有 adapter 時用 jwt)· `core/lib/assert.js` L28 · `providers/google.d.ts`(`email_verified`)· `openid-client/lib/helpers/request.js` L46(`timeout: 3500`) | 2026-10-31 |
| [SH] | `sharp/lib/index.d.ts`(`limitInputPixels` 預設 268402689、`timeout()` 預設 0 = 無限、預設剝除 metadata、`concurrency()` 預設 = CPU 核數) | 2026-10-31 |
| [Z] | zod 4.6.7 本機實測:`z.object` 預設剝除未知鍵;`z.strictObject` 遇到未知鍵回 `unrecognized_keys`;issue 不帶輸入值 | 2026-10-31 |
| [L] | lint 規則 ID 以實際載入外掛確認:eslint-config-next 16.4.3 註冊的 `react` 7.37.5、`react-hooks` 7.1.1、`import` 2.32.0、`jsx-a11y` 6.10.2、`@next/next` 16.4.3、`typescript-eslint` 8.72.0;core eslint 9.39.5。另在 scratch 目錄跑一份 bad / good 範例:6 個 `no-restricted-syntax` selector 與 `no-restricted-properties` / `no-restricted-globals` 全數命中 bad(含折成多行的 `Promise.all(\n items.map(`),good 0 筆 | 2026-10-31 |
| [PN] | pnpm 10.32.1 bundle 含 `strictDepBuilds` / `blockExoticSubdeps` / `trustPolicy` 設定名;`pnpm audit --prod` 實跑結果「No known vulnerabilities found」;`pnpm licenses list --prod --json` 與 `pnpm why --prod` 實跑 | 2026-10-31 |

**待回查**(沒有真的查到,不得當已查證引用):
- Prisma 互動式交易 `maxWait` / `timeout` 的預設值(runtime 原始碼裡找不到常數)→ P3-2 改成「明設,不依賴預設」
- Prisma `contains` 會不會跳脫使用者輸入的 `%` / `_` → S1-3
- Prisma 7 的 `$on('query')` 是不是每條 SQL 都發一個事件 → P1-1 用陽性對照實測
- 多實例部署時,in-memory `use cache` 與 `updateTag` 是否只作用在本實例 → P7-4
- pnpm `strictDepBuilds` / `blockExoticSubdeps` / `trustPolicy` 的完整語意(只確認設定名存在,語意來自記憶)→ S7-2
- React Flight 反序列化 RCE(CVE-2025-55182「React2Shell」)修補版本與 react 19.3.0 的對照 → S2 註
- Node `UV_THREADPOOL_SIZE` 預設值(記憶中是 4)→ P4
- next-auth v4 的維護狀態 → S7-5
- gitleaks 子命令名稱(依安裝版本)→ S5-5

## 輸入(動手前先查,`_generator.md` §一)

| # | 查什麼 | 結果 |
|---|---|---|
| 1 | 實際棧與版本 | 見上方版本列。生成當下曾與 CLAUDE.md §2 不一致（寫 Tailwind、Auth.js、附件檔名 `nextjs-prisma-postgres.md`、R13 `gap-*`），2026-10-31 已由主 agent 修正 CLAUDE.md §2／§4／R13 |
| 2 | 部署形態 | **未定**(CLAUDE.md §2.4)。這是本檔最大的輸入缺口,會影響:P5-2 連線池乘法、S8-7 action 加密金鑰、P7-4 多實例快取、S7-3「prod 集合」的定義、圖片網域(S8-5)、rate limit 的儲存位置(S4-6)。查法:repo 沒有 Dockerfile / CI 設定(`ls` 只看到 `next.config.ts` 與 `pnpm-workspace.yaml`) |
| 3 | 既有 linter 規則集 | `eslint.config.mjs` = `eslint-config-next/core-web-vitals` + `/typescript`。後者只開 `typescript-eslint` 的 `recommended`,**沒有開 type-checked**(查法:`node_modules/eslint-config-next/dist/typescript.js`)⇒ 需要型別資訊的規則(P4-3)要自己開 `projectService` |
| 4 | 自家 repo 已有的裁定 | `catalog.md`(上傳 ≤ 15MB/張、≤ 20 張/商品、只收 JPEG/PNG/WebP、sharp 轉 WebP 並去 EXIF、`requireAdmin()` 單一入口、`ProductSpec` 複合主鍵、狀態 DRAFT/PUBLISHED/HIDDEN/SOLD)· `frontend-design-principles.md` §B0(antd token 權威是 `src/theme/tokens.ts`、禁 `next/font/google`)· 兩份 baseline 的 §0 |
| 5 | 已知傷害面 | 官方 security 文件 [N1][N2][N8][N12] + 框架預設值(見 S8 與 P3)。不適用:多租戶 / RLS(單一賣方)、LLM(目前沒有 AI 功能) |

**目錄慣例(本檔的守衛依賴它,⏳ 屬結構提案,請在 review 時一併裁定)**:`src/server/`(`db.ts` `env.ts` `log.ts` `errors.ts` `action.ts` `http.ts` `concurrency.ts` `pagination.ts`)· `src/modules/<domain>/server/`(各模組的 DAL;公開型錄放 `catalog/server/public/`,圖片管線放 `catalog/server/images/`)· `src/app/admin/`(後台路由)· `src/copy/`(R12 文案)。

---

## 安全維度

### S1 注入

- **S1-1 [P0]** 禁用 `$queryRawUnsafe` / `$executeRawUnsafe` / `Prisma.raw()`;raw SQL 只寫 `` prisma.$queryRaw`…${值}` `` 或 `Prisma.sql` —— Unsafe 版直接把字串送進 SQL;`Prisma.raw` 是「把字串當 SQL」的逃生門,官方文件把它列為誤用路徑(逐字:"Another way to make these methods vulnerable is misuse of the `Prisma.raw` function")
  · 執法點:eslint core `no-restricted-properties`(`{property:'$queryRawUnsafe'}` `{property:'$executeRawUnsafe'}` `{object:'Prisma',property:'raw'}`)· 出處 [P1][L]
  · 內建涵蓋:`$queryRaw` 的簽章是 `TemplateStringsArray | Sql`(client.d.ts L212),直接傳 string 會被 `pnpm type-check` 擋下
- **S1-2 [P0]** 動態排序 / 欄位一律先過 zod `enum`,再查常數表換成 Prisma 的 `orderBy` / `select` 物件;禁止寫 computed key(`orderBy: { [input]: 'asc' }`)—— identifier 不能參數化(逐字:"Variables cannot be used for identifiers such as column names");用使用者給的欄位排序,等於讓人用排序結果反推後台欄位(`sourceName`)的值
  · 執法點:eslint `no-restricted-syntax` selector `Property[key.name=/^(orderBy|select|include)$/] Property[computed=true]` · 出處 [P1][L]
- **S1-3 [P1]** 前台搜尋用 `contains` + `mode: 'insensitive'`;Prisma 會不會跳脫 `%` / `_` 待回查,確認之前先在 DAL 跳脫 `\` `%` `_` —— 搜 `%` 會回傳全部(資料都是公開的,傷害是效能,不是外洩)
  · 執法點:整合測試「搜尋 `%` 回傳 0 筆」(review 時確認有這一支)

### S2 反序列化 / 動態求值

- **S2-1 [P0]** 禁 `eval` / `new Function` / 字串形式的 `setTimeout` —— 等於在伺服器上執行任意碼
  · 執法點:eslint core `no-eval` `no-implied-eval` `no-new-func`(都是 `error`)· 出處 [L]
- **S2-2 [P0]** 自家程式碼禁用 `dangerouslySetInnerHTML` —— 商品文字全部來自後台輸入(`catalog.md` 已裁定不做富文本),React 預設跳脫是唯一的 XSS 防線。`AntdRegistry` 內部用它注入 CSS(套件內部,lint 不掃 `node_modules`),不受此條影響
  · 執法點:eslint `react/no-danger: 'error'` · 出處 [A1][L]
- **S2-3 [P0]** sharp(libvips)是不可信二進位的解析器:magic bytes 驗過才交給 sharp;明設 `limitInputPixels`(建議 ≤ 50,000,000;預設 268,402,689 像素,以 RGBA 解碼約 1GB);SVG、HEIC 不進 sharp;sharp 只准在 `src/modules/catalog/server/images/` 使用
  · 執法點:`guards/sharp.sh`(位置 + `limitInputPixels` 字樣)· 整合測試:header 宣告 20000×20000 的 fixture 被拒、SVG 被拒 · 出處 [SH]
- 註(②框架層涵蓋):Server Action 參數由 React Flight 反序列化,歷史上出過 RCE(CVE-2025-55182「React2Shell」,修補版本對照**待回查**)。本專案沒有能自己加的防線,由 S7-3 的 `audit --prod` high 門檻擋已知版本。

### S3 輸入邊界

- **S3-1 [P0]** 每個 Server Action 都要用 `export const x = adminAction(schema, fn)` / `publicAction(schema, fn)` 包裝器宣告(`src/server/action.ts`:先認證 → zod `safeParse` → 執行 → 錯誤轉譯 → audit);`'use server'` 檔不得 `export async function` 或 `export default` —— TS 型別在執行期不存在,Action 參數就是攻擊者送來的 POST body(逐字 [N2]:"Treat `FormData`, query parameters, and headers as untrusted")。antd `Form` 的 `rules`、`Upload` 的 `accept` / `beforeUpload` 都只是 UX
  · 執法點:`guards/server-actions.sh` · 出處 [N1][N2]
- **S3-2 [P0]** 禁止在元件裡寫 inline `'use server'`(閉包 action)—— 閉包變數會加密後送到瀏覽器再送回來(逐字 [N1]:"We don't recommend relying on encryption alone"),而且會繞過 S3-1 的包裝器檢查
  · 執法點:`guards/server-actions.sh`(縮排過的 `'use server'` 一律報錯)· 出處 [N1]
- **S3-3 [P0]** 禁止寫 `formData.get(...) as string` —— `get()` 回傳 `FormDataEntryValue | null`(可能是 `File`),一加斷言就等於關掉檢查;改用 zod 解析整個 FormData
  · 執法點:eslint `no-restricted-syntax` selector `TSAsExpression > CallExpression[callee.property.name='get']` · 出處 [L]
- **S3-4 [P0]** 環境變數只在 `src/server/env.ts` 用一份 zod schema 解析一次,並在 `src/instrumentation.ts` 的 `register()` 呼叫(伺服器接請求前跑一次,啟動時就失敗);其他檔案禁讀 `process.env` —— 逐字 [N1]:"only the Data Access Layer should access `process.env`"。zod 4 的 issue 不帶輸入值 [Z],可以安全地印出 issue path
  · 執法點:eslint `no-restricted-properties` `{object:'process',property:'env'}`,override 只放行 `src/server/env.ts`、`src/instrumentation.ts`、`prisma7.config.ts`、`next.config.ts`、`playwright.config.ts`、`vitest.config.ts` · 出處 [N1][N14][Z]
- **S3-5 [P1]** 路由的 `params` / `searchParams`(Next 16 是 Promise)`await` 之後用 zod 解析;`[id]` 格式不合就 `notFound()` —— [N1] Auditing 清單逐字:"Folders with brackets are user input. Are params validated?"
  · 執法點:review
- **S3-6 [P1]** Action 的輸入 schema 只列使用者可以改的欄位;`status` 走專用 action,`id` 只能當參照用 —— zod `z.object` 預設會剝除未知鍵 [Z],但 schema 本身多寫一個欄位,就是 mass assignment。Prisma `Json` 欄位(`AuditLog.diff`)讀出來時也要用 zod 解析
  · 執法點:review

### S4 授權執法點

本棧的 authz 執法層 = **DAL / action 包裝器裡的 `requireAdmin()`**。最容易繞過的路徑依序是:Server Action(公開 POST)、layout(擋不住 page)、`proxy.ts`(matcher 一改就失效)。

- **S4-1 [P0]** `requireAdmin()` 寫在 DAL 與 action 包裝器裡;`src/app/admin/**` 的每個 `page.tsx` / `route.ts` 也要自己呼叫。**layout 的檢查不算數** —— 逐字 [N8]:"A layout also does not control whether the rest of the route renders";[N2]:"Render-time gating … is not a security boundary"
  · 執法點:`guards/admin-authz.sh` · 出處 [N2][N8]
- **S4-2 [P0]** e2e:已登入時錄下一次真實的 Server Action 請求(`Next-Action` header + body),再用沒有 cookie 的新 browser context 重放 → 不得成功,DB 沒有變更 —— 這就是安全 §0 #1 的「未登入打 Server Action」;action ID 雖然加密,但仍然要當成直接 POST 打得到(逐字 [N1]:"you should still treat Server Actions as reachable via direct POST requests")
  · 執法點:`pnpm test:e2e`(spec `e2e/security/action-replay.spec.ts`)· 出處 [N1]
- **S4-3 [P0]** next-auth `signIn` callback 只在 `account.provider === 'google' && profile.email_verified === true && allowlist.has(email.trim().toLowerCase())` 時放行;`requireAdmin()` 每次都重查一次 allowlist —— 沒有 adapter 時 session 是 JWT、maxAge 預設 30 天([NA1] init.js L45/L66),把人從 allowlist 拿掉**不會撤銷已簽出的 JWT**
  · 執法點:單元測試(未驗證 email、不在名單、大寫 email、非 google provider、名單移除後 `requireAdmin` 拒絕,五案)· 出處 [NA1]
- **S4-4 [P0]** 公開 DAL 只回傳 `status IN (PUBLISHED, SOLD)` 的商品;DRAFT / HIDDEN 用 id 直接打也回 404。公開 DTO 用 `select` 常數,不含 `sourceName` / `sourceLicenseNo` —— 這是本專案的 object-level 授權:單一賣方沒有 tenant,但有「未上架」。草稿可能還沒填許可證字號,被前台看到就違反 R11(醫材法 §70-1-7「意圖販賣而陳列」)
  · 執法點:整合測試(建立 DRAFT / HIDDEN → 每個公開 DAL 函式都查不到;公開 DTO 的鍵 ⊆ 白名單)· e2e(草稿 URL → 404)· 出處 [N1](DTO)
- **S4-5 [P0]** 會改資料的 Route Handler 要自己比對 `Origin` 與 `NEXTAUTH_URL` 的 origin —— Server Action 有內建的 Origin/Host 比對 [N3],Route Handler 沒有(查法:`grep -n -iE "origin|csrf" …/03-file-conventions/route.md …/01-getting-started/15-route-handlers.md` 只命中 CORS 範例)。另外 Action 對「**沒有 Origin header 的請求只發警告、照樣放行**」(逐字 [N3]:"A request that carries no `Origin` header at all is allowed through with a warning rather than rejected")
  · 執法點:整合測試(上傳 handler:沒有 Origin / 外站 Origin → 403)· 出處 [N3]
- **S4-6 [P0]** 登入與詢價送出要有 rate limit —— Next 沒有內建;取 IP 時只信任部署平台指定的那個 header(平台未定 = 輸入缺口)。儲存位置(單實例記憶體或 Postgres 表)⏳ 需人裁定
  · 執法點:整合測試(同 key 在時間窗內第 N+1 次 → 拒絕)
- **S4-7 [P0]** 整合測試用與 prod 相同的低權 app role:testcontainers 的預設使用者是 superuser,所以 global setup 用 owner 跑 migrate、建立 `asclepia_app`(NOSUPERUSER、只有 DML grant、`AuditLog` 只有 INSERT/SELECT),測試的 `DATABASE_URL` 用這個 role —— superuser 會讓 grant 與 audit 不可變的 trigger 測試假綠(baseline §2 🔴)
  · 執法點:Vitest global setup 斷言 `SELECT rolsuper FROM pg_roles WHERE rolname = current_user` 為 `false`;陽性對照:同一支斷言用 owner 連線必須得 `true`

### S5 Secret 與設定

- **S5-1 [P0]** `NEXT_PUBLIC_*` 走白名單(初始為空;MVP 前端不需要任何公開變數)—— 這類變數在 `next build` 時內聯進 JS bundle,之後改 env 也不會生效 [N6]
  · 執法點:`guards/env-public.sh`(白名單檔 `scripts/guards/next-public.allow`)· 出處 [N6]
- **S5-2 [P0]** `next.config.ts` 禁用 `env:` 鍵 —— 逐字 [N6]:"environment variables specified in this way will **always** be included in the JavaScript bundle"
  · 執法點:`guards/next-config.sh` · 出處 [N6]
- **S5-3 [P0]** 建置產物掃 secret 實值:`pnpm build` 之後,在 `.next/static` 用 `grep -rlF` 搜每個 secret 的實際值(`DATABASE_URL` 另外拆出密碼段單獨搜)→ 必須 0 筆;守衛先斷言 `.next/static` 裡至少有一個 `.js`(擋「探針根本沒跑」),並附 `--self-test` 陽性對照
  · 執法點:`guards/bundle-secrets.sh`(CI 在 build 之後跑,build 時注入形狀真實的假 secret)· 出處 [N6]
- **S5-4 [P0]** DAL 與 env 檔第一行都要寫 `import 'server-only'` —— 被 client 元件 import 時會變成 build error [N1]。Next 自帶型別宣告(`next/types/global.d.ts:57`),tsc 不需要安裝套件;但 **Vitest 不經過 Next,會解析失敗**(見〈需要接線〉#W3)
  · 執法點:`guards/db-boundary.sh` · 出處 [N1]
- **S5-5 [P0]** secret 清單與規格寫在 env schema:`DATABASE_URL`(app role)· `MIGRATE_DATABASE_URL`(owner role,只給 `prisma7.config.ts` 用)· `NEXTAUTH_SECRET`(≥ 32 字元;prod 缺少時 next-auth 會 throw,dev 只有警告 [NA1] assert.js L28)· `NEXTAUTH_URL` · `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` · `ADMIN_EMAILS`;多實例部署再加 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`(S8-7)。git 歷史掃 secret
  · 執法點:單元測試(env schema:缺少 / 太短 → 失敗,錯誤訊息只帶 key 名)· secret 掃描 **需安裝 gitleaks**(repo 尚未 git init;子命令依安裝版本,待回查)· 出處 [NA1][Z]

### S6 錯誤與日誌外洩

- **S6-1 [P0]** 錯誤轉譯只有一個入口 `src/server/errors.ts`:action 包裝器 catch 之後回傳 `{ ok: false, code, message }`,`message` 取自 `src/copy/`,沒有對映的錯誤回固定的一句;`src/app` 與 `src/modules` 不得讀 `.message` / `.stack` —— production 只會把 **Server Component 拋出**的錯誤遮蔽成 digest [N10];**Action 的回傳值與 Route Handler 的 Response 都不會被遮蔽**,而 Prisma 的錯誤訊息帶有 model、欄位與參數
  · 執法點:`guards/error-leak.sh` · 單元測試(沒有對映的錯誤 → 固定句,不是 `error.message`;Prisma `P2002` → 對映句)· 出處 [N10]
- **S6-2 [P0]** 禁用 `console.*`,只能經過 `src/server/log.ts`(內建 redact:`email` `phone` `name` `cookie` `authorization` 等鍵)—— 詢價個資不進 log(安全 §0 #3)
  · 執法點:eslint `no-console: 'error'`(override 放行 `src/server/log.ts`)· 單元測試(redact)· 出處 [L]
- **S6-3 [P0]** e2e 對 production build(`next build && next start`)跑,不對 `next dev` —— dev 會把原始 message 序列化給 client(逐字 [N10]:"this behavior is different in production"),在 dev 下跑「錯誤不外洩」的斷言永遠是假綠
  · 執法點:`playwright.config.ts` 的 `webServer.command` = `pnpm build && pnpm start`;e2e 觸發一個伺服器錯誤,斷言頁面沒有 stack 或原文 · 出處 [N10]
- **S6-4 [P1]** `src/instrumentation.ts` 匯出 `onRequestError`,記錄 digest、route 與錯誤類別(不記 body)—— 讓畫面上的 digest 對得回 log [N14]
  · 執法點:review

### S7 相依與供應鏈

- **S7-1 [P0]** CI 一律 `pnpm install --frozen-lockfile` —— lockfile 與 `package.json` 不一致時直接失敗,不是悄悄重解
  · 執法點:CI job(install 步驟)· 出處 [PN]
- **S7-2 [P0]** `pnpm-workspace.yaml` 保留 `minimumReleaseAge: 10080`,另加 `strictDepBuilds: true`(有未核准 build script 的相依時讓 install 失敗,不是靜默略過)、`blockExoticSubdeps: true`(擋 git / tarball 來源的間接相依)—— pnpm 10 預設不跑相依的 install script;`ignoredBuiltDependencies` 只是消掉警告。設定名已確認存在於 pnpm 10.32.1,語意**待回查**
  · 執法點:設定旗標 + CI install · 出處 [PN]
- **S7-3 [P0]** 兩道 audit:`pnpm audit --prod --audit-level high` 與 `pnpm audit --audit-level critical`。🔴 pnpm 的「prod 集合」**含整棵 Prisma CLI**:`@prisma/client` 把 `prisma` 宣告為 optional peer,`autoInstallPeers` 會把它拉進 prod 鏈(查法:`pnpm why --prod elkjs` → `@prisma/studio-core ← prisma ← @prisma/client`)。真正上 prod 的集合要看部署腳本怎麼裝(例如 `output: 'standalone'` 的 trace);部署定案之後改用那一份為準
  · 執法點:CI job · 出處 [PN]
- **S7-4 [P0]** 授權門檻:`pnpm licenses list --prod --json` 對允許清單(MIT / ISC / BSD-2-Clause / BSD-3-Clause / Apache-2.0 / 0BSD)檢查,清單外的要列進例外檔,並寫上「讀過 LICENSE 本文 + 日期 + 結論」。2026-10-31 實跑,prod 集合出現 LGPL-3.0-or-later(`@img/sharp-libvips-*`,sharp 的預編譯 libvips)、EPL-2.0(`elkjs`,Prisma Studio)、CC-BY-4.0(`caniuse-lite`)、Unlicense(`postgres`、`robust-predicates`)、`MIT and ISC`(`@visx/vendor`)—— 依 pre-dev #7 逐案裁定,不是本檔可以決定的
  · 執法點:`guards/licenses.sh` · 出處 [PN]
- **S7-5 [P1]** sharp 靠 `@img/sharp-<os>-<arch>` 預編譯的 optional 套件(所以不需要 install script),部署映像必須在目標平台上 install;next-auth v4 的維護狀態待回查(CLAUDE.md 寫 Auth.js,實裝 v4)
  · 執法點:review(部署定案時)

### S8 平台特有陷阱

- **S8-1 [P0]** `next.config.ts` 要寫 `poweredByHeader: false` —— Next 預設會送 `x-powered-by` [N11]
  · 執法點:`guards/next-config.sh` + e2e(回應沒有 `x-powered-by`)· 出處 [N11]
- **S8-2 [P0]** 安全標頭用 `next.config.ts` 的 `headers()` 送出:CSP(至少 `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;`img-src` 只列 self 與圖片網域)、`X-Content-Type-Options: nosniff`、`Referrer-Policy: strict-origin-when-cross-origin`、`Permissions-Policy`;上 HTTPS 之後加 HSTS —— Next 預設一個安全標頭都不送(`headers.md` 只給範例)。🔴 **nonce 型 CSP 與 `cacheComponents` 衝突**:逐字 [N12]:"Partial Prerendering (PPR) is incompatible with nonce-based CSP",而 `cacheComponents` 預設就是 PPR [N14];`AntdRegistry` 注入的 `<style>` 也不帶 nonce(原始碼 [A1])⇒ 只能在「不用 nonce 的 CSP(`'unsafe-inline'`)/ experimental SRI / 放棄 static shell」三者中選一 ⏳ 需人裁定
  · 執法點:e2e(首頁、商品頁、`/admin` 都檢查上列標頭存在)· 出處 [N11][N12][A1]
- **S8-3 [P0]** `experimental.serverActions.bodySizeLimit` 明寫成 `'1mb'`(就是預設值,寫出來才看得見);商品圖上傳**不走 Server Action** —— 這是全域設定,調到 16MB 就連公開的詢價 action 也收 16MB。Route Handler 沒有文件記載的 body 上限(查法:`grep -n -iE "body size|bodySize|limit" …/route.md …/15-route-handlers.md` 回 0 筆),所以上傳 handler 要先驗 `Content-Length` ≤ 15MB + 64KB,串流讀取時累計位元組,超過就中止。上傳走 Route Handler 還是調大 limit ⏳ 需人裁定(預設建議 Route Handler)
  · 執法點:`guards/next-config.sh`(`bodySizeLimit: '1mb'`)· 整合測試(16MB body → 413,而且在讀完 body 之前就回)· 出處 [N3]
- **S8-4 [P0]** 不用 `proxy.ts` 做 authz(authz 在 DAL);`middleware.ts` 不得存在。**2026-10-31 例外**:`src/proxy.ts` 只為了在 production 對 `/mockup` 回 404 而存在 —— render-time `notFound()` 在 root `<Suspense>` 下會回 200(實測,見 `e2e/mockup-gate.spec.ts`)。matcher 只能是 `["/mockup", "/mockup/:path*"]`,必須排除上傳路徑 —— proxy 會把 body 複製進記憶體,上限預設 10MB,超過時「只緩衝到上限並記一行警告」,**不是拒絕**(逐字 [N5]:"the body will only be buffered up to the limit")⇒ 15MB 的上傳會被截斷。`middleware` 在 Next 16 已經 deprecated、改名為 `proxy` [N4]
  · 執法點:`guards/no-proxy.sh`(`middleware.ts` 不存在;`src/proxy.ts` 的 matcher 一字不差等於上述常數)· 出處 [N4][N5]
- **S8-5 [P0]** images 設定:`remotePatterns` 寫精確的 hostname 與 pathname(禁 `*` / `**` hostname)並帶 `search: ''`;`maximumRedirects: 0`(預設 3,而且逐字 [N9]:"these redirects do not need to satisfy remotePatterns");`maximumResponseBody` 明設(預設 50MB;展示圖 ≤ 300KB,設 5MB 已經很寬);禁用 `dangerouslyAllowSVG` / `dangerouslyAllowLocalIP`。圖片已經在上傳時轉成 1600 / 400 兩種尺寸,也可以 `unoptimized` 完全不經過 optimizer ⏳ 部署時裁定
  · 執法點:`guards/next-config.sh` · 出處 [N9]
- **S8-6 [P0]** 禁開 `experimental.exposeTestingApiInProductionBuild`、`productionBrowserSourceMaps`、`typescript.ignoreBuildErrors` —— 前兩個在 prod 暴露測試 API / 原始碼 [N11],第三個讓型別錯誤照樣出貨
  · 執法點:`guards/next-config.sh` · 出處 [N11]
- **S8-7 [P1]** 多實例自架時要設 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`,否則各實例的金鑰不同,action 閉包解不開 [N1][N2]
  · 執法點:部署定案時寫進 env schema(S5-5)
- **S8-8 [P1]** 新部署會換 action ID,還開著舊分頁的員工按「上架」會得到 "Failed to find Server Action" [N2] ⇒ 錯誤轉譯(S6-1)要有一句「頁面已更新,請重新整理後再送出(剛填的內容……)」
  · 執法點:review(`src/copy/` 有這個 code 的對映)

---

## 效能維度

### P1 N+1 與批次載入

- **P1-1 [P0]** 整合測試用 `expectMaxQueries(fn, n)` assert §0 的數字:列表頁 DAL ≤ 5、商品頁 ≤ 5、詢價送出 ≤ 3。計數靠 `new PrismaClient({ log: [{ emit: 'event', level: 'query' }] })` + `$on('query')`(API 存在於 client.d.ts L1210)。**陽性對照**:一支刻意 N+1 的 fixture(迴圈內 `findUnique` ×10)必須被判紅 —— Prisma 7 走 driver adapter 時,是不是每條 SQL 都發事件**待回查**,這支陽性對照就是查法
  · 執法點:`pnpm test`(整合)· 出處 [P2](client 建構)、performance §2
- **P1-2 [P1]** 關聯用巢狀 `select` / `include` 一次取回;`for … of` 裡不得 `await prisma.*`(圖片管線刻意逐張處理是例外,見 P4-2)
  · 執法點:review(core `no-await-in-loop` 會誤擋圖片管線,所以不開成 lint)

### P2 分頁與上限

- **P2-1 [P0]** 在 `src/server/db.ts` 用 Prisma client extension(`$extends({ query: { $allModels: { findMany } } })`)強制 `findMany` 要帶 `take`,且 `|take| ≤ 49`(48 筆 + 1 筆探下一頁);沒帶 `take` 直接 throw —— `findMany()` 不帶參數就是全表查
  · 執法點:整合測試(陽性:沒有 `take` → throw;陰性:`take: 49` → 通過)· 出處 performance §2
- **P2-2 [P0]** 列表用 cursor 分頁:`orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }]` + `cursor: { id }` + `skip: 1` + `take: n + 1`,只寫在 `src/server/pagination.ts` 一處;禁止 `skip: page * 48` 這種 offset 分頁
  · 執法點:eslint `no-restricted-syntax` selector `Property[key.name='skip'][value.type!='Literal']`(override 放行 `pagination.ts`)· 出處 [L]
- **P2-3 [P1]** 巢狀的 to-many `include`(images、specs)也要帶 `take`(20 / 規格上限);索引欄位順序要對上 `orderBy`(`(status, categoryId, publishedAt DESC, id DESC)`)
  · 執法點:review(migration 時問「這條索引是哪個查詢在用」)
- **P2-4 [P1]** antd `Table` 不得餵整包 `dataSource` —— antd 預設在**瀏覽器端** slice 分頁([A1] InternalTable.js L317–335),等於先把全部資料載進來。後台列表一律 `pagination={false}`,再用 URL search params 做 cursor 導覽
  · 執法點:review · 出處 [A1]

### P3 逾時與取消

- **P3-1 [P0]** pg pool 明設 `connectionTimeoutMillis`(預設 0 = 等 pool 等到天荒地老)、`statement_timeout` 與 `query_timeout`(預設 `false` = 無限)、`idleTimeoutMillis`、`max`,全部經過 `new PrismaPg({ connectionString, … })` 傳入 —— Prisma 7 的連線池來自 driver(逐字 [P2]:pooling "now come[s] from the driver itself")
  · 執法點:整合測試(陽性:`SELECT pg_sleep(<statement_timeout 秒數 + 1>)` 在預算內被中止;對照:`SHOW statement_timeout` 的值等於設定值)· 出處 [P2]
- **P3-2 [P0]** 互動式交易在 `PrismaClient` 建構子明設 `transactionOptions: { maxWait, timeout }`(預設值待回查,所以不依賴預設);交易裡禁止外呼
  · 執法點:`guards/db-boundary.sh`(`src/server/db.ts` 含 `transactionOptions`)· 出處 [P2]
- **P3-3 [P0]** 禁用全域 `fetch`;要外呼只能經過 `src/server/http.ts`(用 `AbortSignal.timeout(ms)`)—— MVP 的第三方外呼是 0 次(§0 #3),所以 wrapper 可以晚點寫,但 lint 先擋。Node 內建 fetch 的預設逾時待回查
  · 執法點:eslint `no-restricted-globals` `{name:'fetch'}`(override 放行 `http.ts`)· 出處 [L]
- **P3-4 [P0]** sharp 明設 `.timeout({ seconds: 30 })` —— 預設 0 = 無限([SH]:"Use a value of zero to continue processing indefinitely, the default behaviour");30s 是 §0 背景任務的上限
  · 執法點:`guards/sharp.sh`(含 `.timeout(`)· 出處 [SH]
- **P3-5 [P1]** 請求總預算:Next 自架沒有內建的 request deadline;`maxDuration` 只是「給部署平台讀」的值(逐字 [N14]:"Deployment platforms can use `maxDuration`"),`next start` 自架時是否執行屬推論、未查證 ⇒ 各層逾時(pool 取連線 + statement + sharp)寫成 `src/server/budget.ts` 常數,加總對上 §0 寫路徑的上限
  · 執法點:review
- ②內建涵蓋:Google OAuth 的外呼由 next-auth → openid-client 5.7.1 發出,預設 `timeout: 3500`([NA1] request.js L46),可以用 provider 的 `httpOptions.timeout` 調整。

### P4 並發模型與上限

模型:Node 單執行緒事件迴圈,Server Component / Action / Route Handler 共用;sharp 與非同步 fs 跑在 libuv thread pool(`UV_THREADPOOL_SIZE` 預設值待回查);sharp 處理每張圖用的執行緒數預設 = CPU 核數 [SH]。

- **P4-1 [P0]** 禁止寫 `Promise.all(xs.map(…))` / `Promise.allSettled(xs.map(…))` 這種無上限 fan-out;改用 `src/server/concurrency.ts` 的 `mapLimit(xs, n, fn)`(自己寫,不加相依)
  · 執法點:eslint `no-restricted-syntax` selector `CallExpression[callee.object.name='Promise'][callee.property.name=/^(all|allSettled)$/] > CallExpression[callee.property.name='map']`(AST 比對,不受折行影響,已實測)· 出處 [L]
- **P4-2 [P0]** 圖片處理:一個請求一張圖;同一個實例同時最多處理 2 張(semaphore)—— sharp 吃滿 CPU 時,同一個實例上前台的 p95 會一起被拖垮
  · 執法點:整合測試(同時送 5 張,觀測到的同時處理數 ≤ 2)· 出處 [SH]
- **P4-3 [P0]** 禁止 floating promise —— 漏 `await` 的 `prisma.auditLog.create()` 在回應送出後失敗,沒有人會知道(R5 audit 遺失)
  · 執法點:`@typescript-eslint/no-floating-promises` + `@typescript-eslint/no-misused-promises`(需要型別資訊:要在 `eslint.config.mjs` 開 `parserOptions.projectService: true`,見〈輸入〉#3)· 出處 [L]
- **P4-4 [P0]** `src/app` 與 `src/modules` 禁用同步 I/O(`*Sync`)—— 會阻塞整個事件迴圈,不只拖慢當下那一個請求
  · 執法點:eslint `no-restricted-syntax` selector `CallExpression[callee.property.name=/Sync$/]`(只套用這兩個目錄)· 出處 [L]
- **P4-5 [P2]** 回應送出後要做的事(之後的詢價通知信)用 `after()` —— 它在同一個 process 裡跑,沒有重試也沒有持久化,**不是佇列** [N14]

### P5 連線池與資源

- **P5-1 [P0]** `PrismaClient` / `PrismaPg` / `pg.Pool` 只在 `src/server/db.ts` 建構;dev 環境掛在 `globalThis` 上,避免 HMR 每次重載就多開一個池
  · 執法點:eslint `no-restricted-syntax` selector `NewExpression[callee.name=/^(PrismaClient|PrismaPg|Pool)$/]`(override 放行 `db.ts` 與測試的 global setup)· 出處 [L]
- **P5-2 [P0]** `DB_POOL_MAX × DEPLOY_MAX_INSTANCES + 預留給 migration 與管理連線的數量 < DB_MAX_CONNECTIONS`,三個數字寫進 env schema,用 zod `refine` 在啟動時檢查 —— pg 的 `max` 預設 10 [P2];serverless 是每個實例一個池,乘數會爆。🔴 v6 習慣把 `connection_limit` / `pool_timeout` 寫在 URL 上;Prisma 7 + adapter 的設定處已經換成 driver 欄位([P2] 的映射表),寫在 URL 上推定不會生效也不會報錯(官方頁沒有明說)
  · 執法點:單元測試(env schema:乘數超過上限 → 啟動失敗)· 數字等部署定案(輸入缺口)· 出處 [P2]
- **P5-3 [P1]** 測試 teardown 要 `await prisma.$disconnect()`;如果是自己建 `pg.Pool` 再交給 `PrismaPg`,`disposeExternalPool` 預設 `false`([P2] d.ts),要自己呼叫 `pool.end()`
  · 執法點:review(Vitest 跑完不退出就是這個症狀)

### P6 記憶體與資料量

- **P6-1 [P0]** 上傳 handler 先驗 `Content-Length`,再串流讀取並累計位元組;禁止對沒驗過大小的請求呼叫 `request.formData()` / `arrayBuffer()` —— 這兩個 API 會把整包讀進記憶體;20 張 × 15MB 同時送進來就是 300MB
  · 執法點:整合測試(同 S8-3)
- **P6-2 [P0]** 公開與後台的 DAL 都用 `select` 常數,禁止回傳整個 entity —— `specNote` 最長 5000 字、陣列欄位最多 50 點,列表頁不需要它們;同時也是 S4-4 的 DTO 防線
  · 執法點:整合測試(列表 DTO 的鍵 ⊆ 白名單,同 S4-4)· 出處 [N1]
- **P6-3 [P1]** 明設記憶體與磁碟上限:`cacheMaxMemorySize`(`use cache` 自架時的 in-memory LRU [N7])、`images.maximumDiskCacheSize`(預設用啟動時可用空間的 50% [N9])
  · 執法點:review(部署定案時)

### P7 快取

- **P7-1 [P0]** `'use cache'` 只准出現在 `src/modules/catalog/server/public/`;後台、詢價、admin-auth 一律禁止;`'use cache: private'` / `'use cache: remote'` / `unstable_cache` 全面禁止 —— cache key = build ID + 參數 + 閉包變數 [N7],**不含身分**。本專案沒有 tenant 維度,權限維度是「公開 vs 後台」;用「後台不准快取」整個消掉這一維,就不必靠 key 帶 scope
  · 執法點:`guards/cache.sh` · 出處 [N7]
- **P7-2 [P0]** 每個含 `'use cache'` 的檔案都要同時呼叫 `cacheLife(` 與 `cacheTag(` —— 不呼叫 `cacheLife` 就走 `default` profile(revalidate 15 分鐘、expire 永不 [N7]);沒有 tag 就沒辦法依需要讓它失效
  · 執法點:`guards/cache.sh` · 出處 [N7]
- **P7-3 [P0]** 失效策略:商品內容或狀態變更時,在 Server Action 裡呼叫 `updateTag('product:' + id)` 與 `updateTag('catalog')`;Route Handler(上傳)不能用 `updateTag`,改用 `revalidateTag(tag, { expire: 0 })` [N7];**禁用 `revalidateTag(…, 'max')`** —— `'max'` 是 stale-while-revalidate,下架(HIDDEN)的商品還會再被提供至少一次,而下架是合規動作。`revalidateTag` 單參數的寫法已經 deprecated,會出 TS 錯誤 [N9]
  · 執法點:`guards/cache.sh`(禁 `'max'`)· e2e(後台下架 → 前台同一個 URL 立即 404)· 出處 [N7][N9]
- **P7-4 [P1]** 多實例時,in-memory `use cache` 與 `updateTag` 推定只作用在本實例(待回查 `cacheHandlers.md`)⇒ 部署定案時決定 `cacheHandlers` 或單實例;client router 另有最低 30 秒的 stale time [N7]
  · 執法點:review(部署定案時)

### P8 建置與啟動

- **P8-1 [P0]** CI 順序固定為:`pnpm install --frozen-lockfile` → `pnpm prisma generate`(generated client 在 gitignore 掉的 `src/generated/`)→ `pnpm lint` → `pnpm type-check` → `pnpm test` → `pnpm depcruise` → `pnpm build` → 建置後守衛 → `pnpm test:e2e`。🔴 **`next build` 不再跑 lint**(逐字 [N13]:"`next build` no longer runs linting"),lint 必須是獨立的 job;`next build` 仍然會跑型別檢查(`ignoreBuildErrors` 預設 `false` [N11])
  · 執法點:CI job 定義 · 出處 [N11][N13]
- **P8-2 [P0]** bundle 預算:e2e 在首頁、列表頁、商品頁量 `performance.getEntriesByType('resource')` 裡 JS 的 `transferSize` 總和,不得超過預算(**數字待人定**:performance §0 只定了 HTML/JSON ≤ 200KB,沒定 JS)—— antd 6 幾乎所有元件都是 `'use client'`([A1]:79/80),前台每用一個都要付 hydration 的 JS。`optimizePackageImports` 預設已經包含 `antd` 與 `@ant-design/icons` [N14],不用另外裝 babel-plugin-import。要診斷時用 `pnpm next analyze --output` [N14]
  · 執法點:`pnpm test:e2e`(`e2e/perf/bundle-budget.spec.ts`)· 出處 [A1][N14]
- **P8-3 [P1]** `use cache` 會在 `next build` 時執行,結果寫進 static shell [N7 08-caching.md §Prerendering] ⇒ 公開型錄如果在 build 期查 DB,CI build 就需要 DB,而且 build 讀到的是 CI 的資料。建議商品頁 `generateStaticParams` 回空陣列,讓頁面走 App Shell + 首次訪問時補齊 ⏳ 前台 M3 時裁定
  · 執法點:review
- **P8-4 [P1]** Prisma 設定檔名維持 `prisma7.config.ts`:7.10.1 在沒有傳 `--config` 時,`loadConfigFromFile` **只搜尋 `prisma7.config.*` 候選**([P3] L565),改回舊名 `prisma.config.ts` 推定會被這條路徑忽略;Prisma 7 不會自動載入 `.env`,要靠設定檔第一行的 `import 'dotenv/config'`
  · 執法點:`guards/prisma-config.sh` · 出處 [P3]
- **P8-5 [P1]** 啟動時 `register()` 只做 env 驗證(S3-4),不預熱快取也不連 DB;字型不從外部載入(scaffold 預設的 `next/font/google` 會在 build 時外呼;禁令與守衛已經寫在 `frontend-design-principles.md` §B0,本檔不重複)
  · 執法點:review

---

## 需人裁定(本檔不替人決定,R6 / R7)

1. **上傳通道**:Route Handler(建議,S8-3)或調大全域 `bodySizeLimit`
2. **CSP 策略**:不用 nonce(`'unsafe-inline'`)/ experimental SRI / 放棄 static shell(S8-2)
3. **前台用 antd 的範圍**:影響 P8-2 的預算數字;JS 預算本身也待定
4. **rate limit 儲存位置**:單實例記憶體或 Postgres 表(S4-6)
5. **session maxAge**:預設 30 天;後台建議縮成工作日長度,具體數字由人定(S4-3)
6. **部署平台**:一次解掉 P5-2、P7-4、S7-3、S8-5、S8-7 的輸入缺口
7. **授權例外**:LGPL-3.0 的 libvips 等 5 類(S7-4)
8. **目錄慣例**:`src/server/` 與 `src/modules/<d>/server/`(守衛依賴它,見〈輸入〉)

## 需要接線的執法點

以下都還不存在(查法:`ls scripts setup.sh` → 兩者都不存在;`package.json` 的 scripts 只有 `dev` / `build` / `start` / `lint`)。所有守衛都用 `#!/usr/bin/env bash` + `set -euo pipefail`,根目錄可以用 `ROOT=${ROOT:-src}` 覆寫,方便突變測試。

**W1 package.json scripts**
```
"type-check": "tsc --noEmit",
"test": "vitest run",
"test:e2e": "playwright test",
"depcruise": "depcruise src --config .dependency-cruiser.cjs",
"guards": "bash scripts/guards/run-all.sh",
"guards:postbuild": "bash scripts/guards/bundle-secrets.sh"
```

**W2 eslint.config.mjs**(加在 `nextTs` 之後)
- `globalIgnores` 加 `src/generated/**`(prisma-client generator 的輸出是 TS 原始碼,不忽略會被 lint 掃到,而且會撞上 P5-1、S3-4)
- `files: ['src/**/*.{ts,tsx}']`、`languageOptions.parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname }`
- rules:`no-eval` `no-implied-eval` `no-new-func` `react/no-danger` `no-console` `@typescript-eslint/no-floating-promises` `@typescript-eslint/no-misused-promises`(全部 `error`)
- `no-restricted-properties`:`$queryRawUnsafe` · `$executeRawUnsafe` · `Prisma.raw` · `process.env`
- `no-restricted-globals`:`fetch`
- `no-restricted-syntax`:FANOUT(P4-1)· FORMDATA_CAST(S3-3)· COMPUTED_KEY(S1-2)· OFFSET(P2-2)· NEW_CLIENT(P5-1)· SYNC_IO(P4-4,只套用 `src/app/**`、`src/modules/**`)。selector 原文見各規則;已在 scratch 目錄以 bad / good 範例實測
- 🔴 flat config 裡後面的同名規則會**整組覆蓋**前面的:override 檔(`env.ts` `http.ts` `db.ts` `pagination.ts` `log.ts`)只想放行一項時,其餘項目要重列一次,否則等於整條規則都關掉了 —— 這正是「只漏改一處」的漂移形狀,突變測試要涵蓋

**W3 Vitest**:`vitest.config.ts` 的 `resolve.alias` 把 `server-only` 指到一個空模組(或安裝 `server-only` 套件 —— 新相依,依 §5.3 要人核准);global setup 做 S4-7(低權 role + `rolsuper` 斷言)、P2-1、P3-1;junit reporter 寫在 config 裡

**W4 Playwright**:`webServer.command: 'pnpm build && pnpm start'`(S6-3);spec:`e2e/security/action-replay.spec.ts`(S4-2)、`e2e/security/headers.spec.ts`(S8-1/2)、`e2e/catalog/visibility.spec.ts`(S4-4 / P7-3)、`e2e/perf/bundle-budget.spec.ts`(P8-2)

**W5 dependency-cruiser**(`.dependency-cruiser.cjs`):`no-circular` · 禁止跨模組 deep import(`^src/modules/([^/]+)/` → `^src/modules/(?!$1)[^/]+/(?!index)`)· DB 邊界:`pathNot: ^src/(server|modules/[^/]+/server)/` 的檔案不得依賴 `^src/generated/prisma` 或 `node_modules/(@prisma/client|@prisma/adapter-pg|pg)/`

**W6 pnpm-workspace.yaml**:加 `strictDepBuilds: true`、`blockExoticSubdeps: true`(S7-2)

**W7 守衛**(`scripts/guards/`;`run-all.sh` 依序跑除了 `bundle-secrets.sh` 以外的全部;每支印出「檢查了 N 個檔」,0 個時要明說,不能看起來像綠)

```bash
# server-actions.sh — S3-1, S3-2
files=$(grep -rlE "^['\"]use server['\"];?[[:space:]]*$" "$ROOT" --include='*.ts' --include='*.tsx' || true)
for f in $files; do
  grep -nE '^export (default|(async )?function)' "$f" && fail=1
  grep -nE '^export const [A-Za-z0-9_]+[[:space:]]*=' "$f" | grep -vE '=[[:space:]]*(adminAction|publicAction)\(' && fail=1
done
grep -rnE "^[[:space:]]+['\"]use server['\"]" "$ROOT" --include='*.ts' --include='*.tsx' && fail=1

# admin-authz.sh — S4-1
missing=$(find "$ROOT/app/admin" -type f \( -name 'page.tsx' -o -name 'route.ts' \) -exec grep -L 'requireAdmin(' {} + 2>/dev/null || true)
leak=$(grep -rlE 'getServerSession\(' "$ROOT" --include='*.ts' --include='*.tsx' | grep -v "^$ROOT/modules/admin-auth/" || true)

# no-proxy.sh — S8-4
for p in proxy.ts middleware.ts src/middleware.ts; do [ ! -e "$p" ] || fail=1; done
grep -qxF 'export const config = { matcher: ["/mockup", "/mockup/:path*"] };' src/proxy.ts || fail=1

# db-boundary.sh — S5-4, P3-2
missing=$(grep -rL "^import ['\"]server-only['\"]" "$ROOT/server" "$ROOT"/modules/*/server --include='*.ts' 2>/dev/null || true)
grep -q 'transactionOptions' "$ROOT/server/db.ts" || fail=1

# next-config.sh — S5-2, S8-1, S8-3, S8-5, S8-6
c=next.config.ts
grep -qE 'poweredByHeader:[[:space:]]*false' $c || fail=1
grep -qE "bodySizeLimit:[[:space:]]*['\"]1mb['\"]" $c || fail=1
grep -qE 'maximumRedirects:[[:space:]]*0' $c || fail=1
grep -qE 'maximumResponseBody:' $c || fail=1
grep -nE "^[[:space:]]*env[[:space:]]*:|productionBrowserSourceMaps[[:space:]]*:[[:space:]]*true|exposeTestingApiInProductionBuild[[:space:]]*:[[:space:]]*true|ignoreBuildErrors|dangerouslyAllowSVG|dangerouslyAllowLocalIP|hostname:[[:space:]]*['\"]\*" $c && fail=1
grep -rnE 'debug:[[:space:]]*true' "$ROOT/modules/admin-auth" 2>/dev/null && fail=1

# env-public.sh — S5-1
found=$(grep -rhoE 'NEXT_PUBLIC_[A-Z0-9_]+' "$ROOT" next.config.ts .env.example 2>/dev/null | sort -u || true)
extra=$(comm -23 <(printf '%s\n' "$found" | sed '/^$/d') <(sort -u scripts/guards/next-public.allow | sed '/^$/d'))
[ -z "$extra" ] || fail=1

# error-leak.sh — S6-1
grep -rnE '\b(e|err|error|cause)\??\.(message|stack)\b|JSON\.stringify\((e|err|error)\)' "$ROOT/app" "$ROOT/modules" --include='*.ts' --include='*.tsx' && fail=1

# cache.sh — P7-1, P7-2, P7-3
grep -rlE "['\"]use cache" "$ROOT" --include='*.ts' --include='*.tsx' | grep -v "^$ROOT/modules/catalog/server/public/" && fail=1
grep -rnE "['\"]use cache: (private|remote)['\"]|unstable_cache" "$ROOT" && fail=1
for f in $(grep -rlE "['\"]use cache['\"]" "$ROOT/modules/catalog/server/public" 2>/dev/null); do
  grep -q 'cacheLife(' "$f" && grep -q 'cacheTag(' "$f" || fail=1
done
grep -rnE "revalidateTag\([^)]*['\"]max['\"]" "$ROOT" && fail=1

# sharp.sh — S2-3, P3-4
for f in $(grep -rlE "from ['\"]sharp['\"]" "$ROOT" --include='*.ts' || true); do
  case "$f" in "$ROOT"/modules/catalog/server/images/*) ;; *) fail=1 ;; esac
  grep -q 'limitInputPixels' "$f" && grep -q '\.timeout(' "$f" || fail=1
  grep -nE '\.(withMetadata|keepMetadata|keepExif|withExif|withExifMerge|keepXmp|withXmp)\(' "$f" && fail=1
done

# prisma-config.sh — P8-4
[ -f prisma7.config.ts ] && ! ls prisma.config.* .config/prisma.* >/dev/null 2>&1 || fail=1

# licenses.sh — S7-4
pnpm licenses list --prod --json > reports/licenses.json
node scripts/guards/licenses-check.mjs reports/licenses.json scripts/guards/licenses.allow
#   允許:MIT ISC BSD-2-Clause BSD-3-Clause Apache-2.0 0BSD;其他要在 licenses.allow 裡有「name@version | 授權 | LICENSE 本文查證日 | 結論」

# bundle-secrets.sh — S5-3(build 之後跑)
[ -d .next/static ] && [ "$(find .next/static -name '*.js' | wc -l)" -gt 0 ] || fail=1
for v in DATABASE_URL MIGRATE_DATABASE_URL NEXTAUTH_SECRET GOOGLE_CLIENT_SECRET NEXT_SERVER_ACTIONS_ENCRYPTION_KEY; do
  val="${!v:-}"; [ ${#val} -ge 8 ] || continue
  grep -rlF -- "$val" .next/static && fail=1
done
pw=$(node -e 'try{console.log(new URL(process.argv[1]).password)}catch{}' "${DATABASE_URL:-}")
[ ${#pw} -lt 8 ] || ! grep -rlF -- "$pw" .next/static || fail=1
```

**W8 突變測試**:`scripts/guards/selftest.sh` 對每支守衛用 `ROOT=scripts/guards/fixtures/<guard>/bad` 跑(預期 exit 1)、`…/good` 跑(預期 exit 0);每個 bad fixture **只違反一處**,跑之前先 `diff -q` 斷言 bad 與 good 真的不同。`bundle-secrets.sh --self-test` 在暫存目錄寫一個含假 secret 的 `.js`,預期會被抓到

**W9 CI 指令**(P8-1 的順序):`pnpm install --frozen-lockfile` · `pnpm prisma generate` · `pnpm lint` · `pnpm type-check` · `pnpm guards` · `pnpm test` · `pnpm depcruise` · `pnpm audit --prod --audit-level high` · `pnpm audit --audit-level critical` · `pnpm build` · `pnpm guards:postbuild` · `pnpm test:e2e` · gitleaks(**需安裝**)

**W10 接線本身**:`_generator.md` 要求把本檔名加進 `setup.sh` 的 `STACK_FILES`,並由 `scripts/check-docs-wired.sh` 檢查 —— 這兩個檔目前都不存在(查法:`ls setup.sh scripts`);`_generator.md` 引用的形狀範本 `typescript-nestjs.md` 也不存在(查法:`ls docs/stack-rules`),本檔的清單形狀是自訂的

## CI-fail 禁令清單

- [S1-1] 禁 `$queryRawUnsafe` / `$executeRawUnsafe` / `Prisma.raw` · eslint `no-restricted-properties`
- [S1-2] 禁在 `orderBy` / `select` / `include` 寫 computed key · eslint `no-restricted-syntax` COMPUTED_KEY
- [S2-1] 禁 `eval` / `new Function` / 字串 timer · eslint `no-eval` `no-implied-eval` `no-new-func`
- [S2-2] 禁 `dangerouslySetInnerHTML` · eslint `react/no-danger`
- [S2-3] sharp 只在 `images/`,必設 `limitInputPixels`;SVG / 巨圖被拒 · `guards/sharp.sh` + 整合測試
- [S3-1] `'use server'` 檔只能 `export const x = adminAction/publicAction(...)` · `guards/server-actions.sh`
- [S3-2] 禁 inline `'use server'` · `guards/server-actions.sh`
- [S3-3] 禁 `formData.get() as …` · eslint `no-restricted-syntax` FORMDATA_CAST
- [S3-4] 禁在 `env.ts` 以外讀 `process.env` · eslint `no-restricted-properties`
- [S4-1] admin `page.tsx` / `route.ts` 必呼叫 `requireAdmin(`;`getServerSession` 只在 admin-auth · `guards/admin-authz.sh`
- [S4-2] 無 cookie 重放 Server Action 必失敗 · `pnpm test:e2e` action-replay
- [S4-3] signIn 必驗 `email_verified` + allowlist;`requireAdmin` 每次重查 · 單元測試
- [S4-4] DRAFT / HIDDEN 前台不可見;公開 DTO 鍵 ⊆ 白名單 · 整合測試 + e2e visibility
- [S4-5] 會改資料的 Route Handler 必驗 Origin · 整合測試
- [S4-6] 登入 / 詢價有 rate limit · 整合測試
- [S4-7] 整合測試連線不得是 superuser · Vitest global setup 斷言(附陽性對照)
- [S5-1] `NEXT_PUBLIC_*` 只能是白名單內的名字 · `guards/env-public.sh`
- [S5-2] `next.config.ts` 禁 `env:` · `guards/next-config.sh`
- [S5-3] client bundle 不得含 secret 實值 · `guards/bundle-secrets.sh`(含 self-test)
- [S5-4] `src/server/**`、`src/modules/*/server/**` 必 `import 'server-only'` · `guards/db-boundary.sh`
- [S5-5] env schema 驗 secret 存在與長度;git 不得含 secret · 單元測試 + gitleaks(需安裝)
- [S6-1] `src/app`、`src/modules` 禁讀 `.message` / `.stack`;錯誤轉譯有固定 fallback · `guards/error-leak.sh` + 單元測試
- [S6-2] 禁 `console.*`;log 有 redact · eslint `no-console` + 單元測試
- [S6-3] e2e 跑在 production build · `playwright.config.ts` webServer
- [S7-1] install 用 frozen lockfile · CI
- [S7-2] `strictDepBuilds` / `blockExoticSubdeps` / `minimumReleaseAge` 開啟 · `pnpm-workspace.yaml`
- [S7-3] `audit --prod` 無 high、全樹無 critical · CI
- [S7-4] prod 授權不在允許清單又沒有例外記錄就紅 · `guards/licenses.sh`
- [S8-1] `poweredByHeader: false` · `guards/next-config.sh` + e2e headers
- [S8-2] 安全標頭(CSP / nosniff / Referrer-Policy / Permissions-Policy)存在 · e2e headers
- [S8-3] `bodySizeLimit` 維持 `'1mb'`;上傳 > 15MB 在讀完前回 413 · `guards/next-config.sh` + 整合測試
- [S8-4] 不得存在 `middleware.ts`;`src/proxy.ts` 的 matcher 只能是 `/mockup` · `guards/no-proxy.sh`
- [S8-5] `maximumRedirects: 0`、有 `maximumResponseBody`、禁萬用 hostname / SVG / LocalIP · `guards/next-config.sh`
- [S8-6] 禁 `exposeTestingApiInProductionBuild` / `productionBrowserSourceMaps` / `ignoreBuildErrors` · `guards/next-config.sh`
- [P1-1] 列表 / 商品頁 ≤ 5 query、詢價 ≤ 3(陽性對照必紅)· 整合測試
- [P2-1] `findMany` 沒有 `take` 或 `take` > 49 就 throw · Prisma extension + 整合測試
- [P2-2] 禁 offset `skip` · eslint `no-restricted-syntax` OFFSET
- [P3-1] pool 有 `connectionTimeoutMillis` / `statement_timeout` / `query_timeout`,`pg_sleep` 會被中止 · 整合測試
- [P3-2] `db.ts` 明設 `transactionOptions` · `guards/db-boundary.sh`
- [P3-3] 禁全域 `fetch` · eslint `no-restricted-globals`
- [P3-4] sharp 必設 `.timeout(` · `guards/sharp.sh`
- [P4-1] 禁 `Promise.all(xs.map(…))` · eslint `no-restricted-syntax` FANOUT
- [P4-2] 同一實例同時處理的圖片 ≤ 2 · 整合測試
- [P4-3] 禁 floating promise · `@typescript-eslint/no-floating-promises` + `no-misused-promises`
- [P4-4] `src/app`、`src/modules` 禁 `*Sync` · eslint `no-restricted-syntax` SYNC_IO
- [P5-1] `PrismaClient` / `PrismaPg` / `Pool` 只在 `db.ts` 建構 · eslint `no-restricted-syntax` NEW_CLIENT
- [P5-2] 池上限 × 實例數 + 預留 < DB 上限 · env schema refine + 單元測試
- [P6-1] 上傳先驗大小再讀、串流累計 · 整合測試
- [P6-2] DAL 回 `select` DTO,不回整個 entity · 整合測試
- [P7-1] `'use cache'` 只在 `catalog/server/public/`;禁 `private` / `remote` / `unstable_cache` · `guards/cache.sh`
- [P7-2] `'use cache'` 檔必含 `cacheLife(` + `cacheTag(` · `guards/cache.sh`
- [P7-3] 禁 `revalidateTag(…, 'max')`;下架後前台立即 404 · `guards/cache.sh` + e2e visibility
- [P8-1] CI 順序含獨立的 lint job 與 `prisma generate` · CI 定義
- [P8-2] 前台 JS transferSize ≤ 預算(數字待定)· e2e bundle-budget

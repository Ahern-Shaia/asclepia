import { expect, type Page, test } from "@playwright/test";
import { btn, signIn } from "./support/admin";
import { asClient, noHorizontalScroll, publishAll, seedShop, sql } from "./support/shop";

// 站台設定 (site-config.md §4.2, §4.5-bis). Runs in its own project after every other spec
// (playwright.config.ts SITE_WIDE): the settings are one document for the whole site.
test.describe.configure({ mode: "serial" });
test.beforeEach(({ page }) => asClient(page));

const PHONE = "02-2345-6789";
const SAVE = /儲 ?存$/; // the button has an icon: its name is "save 儲存"

async function openTab(page: Page, tab: "店家資料" | "說明選項") {
  await page.goto("/admin/settings");
  await expect(page.getByRole("heading", { level: 1, name: "站台設定" })).toBeVisible();
  await page.getByRole("tab", { name: tab }).click();
  return page.getByRole("tabpanel", { name: tab });
}

test("store details: refused with a sentence, then saved and live, then restored", async ({
  page,
  context,
}) => {
  await signIn(context);
  const panel = await openTab(page, "店家資料");
  await expect(panel).toContainText("還沒有儲存過");
  await noHorizontalScroll(page);

  // the server refuses what the front end couldn't use, at the field
  await panel.getByLabel("電話").fill("找老闆");
  await panel.getByRole("button", { name: SAVE }).click();
  await expect(panel.getByText("電話只能有數字、空白和 + - ( ) #")).toBeVisible();

  await panel.getByLabel("電話").fill(PHONE);
  await panel.getByLabel("地址").fill("台北市範例路 1 號");
  await panel.getByLabel("營業時間").fill("週一至週五 09:00–18:00");
  await expect(panel.getByText("有未儲存的變更")).toBeVisible();
  await panel.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();
  await expect(panel).toContainText("上次儲存：");

  await page.goto("/");
  await expect(page.locator(`a[href="tel:${PHONE}"]`).first()).toBeAttached();
  await expect(page.getByRole("heading", { name: "看機地點" })).toBeVisible();
  await expect(page.getByText("台北市範例路 1 號").first()).toBeVisible();

  const [{ n }] = await sql<{ n: string }>(
    `select count(*)::text as n from "AuditLog" where "targetType" = 'site-config' and "targetId" = 'PROFILE' and action = 'site-config.save'`,
  );
  expect(Number(n)).toBeGreaterThanOrEqual(1);

  // restore: back to before the save — the defaults — and the phone is gone again
  const again = await openTab(page, "店家資料");
  await again.getByRole("button", { name: /還原上一版/ }).click();
  const dialog = page.getByRole("dialog", { name: "還原上一版？" });
  await expect(dialog).toContainText("不會動到其他分頁的設定");
  await dialog.getByRole("button", { name: btn("還原") }).click();
  await expect(page.getByText("已還原上一版，前台已更新。")).toBeVisible();
  await page.goto("/");
  await expect(page.locator(`a[href="tel:${PHONE}"]`)).toHaveCount(0);
});

test("statements: none until set, then shown where they belong, warned on efficacy words", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([{ name: "e2e-設定", brand: "Alpha", model: "S-9" }]);
  await publishAll(page, context, seeded); // also signs in
  const product = `/products/${seeded.products[0].id}`;

  const panel = await openTab(page, "說明選項");
  await panel.getByLabel("首屏小標").fill("e2e 自有庫存");
  await panel.getByRole("button", { name: "首屏重點：新增一項" }).click();
  await panel.getByLabel("首屏重點第 1 項", { exact: true }).fill("e2e 可開立發票");
  await panel.getByRole("button", { name: "商品頁「保固與交易說明」：新增一項" }).click();
  await panel.getByLabel("商品頁「保固與交易說明」第 1 項", { exact: true }).fill("e2e 保固三個月");
  const services = "首頁「也可以找我們」";
  for (let i = 1; i <= 4; i++)
    await panel.getByRole("button", { name: `${services}：新增一項` }).click();
  await expect(panel.getByRole("button", { name: `${services}：新增一項` })).toBeDisabled();
  await expect(panel.getByText("已經 4 項，是上限。")).toBeVisible();
  for (const i of [4, 3, 2])
    await panel.getByRole("button", { name: `刪除${services}第 ${i} 項` }).click();
  await panel.getByLabel(`${services}第 1 項名稱`, { exact: true }).fill("e2e 收購");
  await panel.getByLabel(`${services}第 1 項說明（選填）`, { exact: true }).fill("治療設備也收");
  await panel.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "「治療」是醫療效果的說法" }),
  ).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("e2e 自有庫存")).toBeVisible();
  await expect(page.getByText("e2e 可開立發票")).toBeVisible();
  await expect(page.getByRole("heading", { name: "也可以找我們" })).toBeVisible();
  await expect(page.getByText("e2e 收購")).toBeVisible();
  await page.goto(product);
  await expect(page.getByRole("heading", { name: "保固與交易說明" })).toBeVisible();
  await expect(page.getByText("e2e 保固三個月")).toBeVisible();

  // restore takes every block away again
  const again = await openTab(page, "說明選項");
  await again.getByRole("button", { name: /還原上一版/ }).click();
  await page
    .getByRole("dialog", { name: "還原上一版？" })
    .getByRole("button", { name: btn("還原") })
    .click();
  await expect(page.getByText("已還原上一版，前台已更新。")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "也可以找我們" })).toHaveCount(0);
  await page.goto(product);
  await expect(page.getByRole("heading", { name: "保固與交易說明" })).toHaveCount(0);
});

test("two people saving the same tab: the second is told to reload, nothing is overwritten", async ({
  page,
  context,
}) => {
  await signIn(context);
  const other = await context.newPage();
  const mine = await openTab(page, "店家資料");
  const theirs = await openTab(other, "店家資料");
  await theirs.getByLabel("標語").fill("e2e 他的標語");
  await theirs.getByRole("button", { name: SAVE }).click();
  await expect(other.getByText("已儲存，前台已更新。")).toBeVisible();

  await mine.getByLabel("標語").fill("e2e 我的標語");
  await mine.getByRole("button", { name: SAVE }).click();
  await expect(mine.getByRole("alert")).toContainText("這筆資料剛被別人改過");
  const [row] = await sql<{ tagline: string }>(
    `select value->>'tagline' as tagline from "SiteConfig" where section = 'PROFILE'`,
  );
  expect(row.tagline).toBe("e2e 他的標語");
});

test("signed out, the settings page is not reachable", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/admin/settings");
  await expect(page).toHaveURL(/\/admin\/login/);
  await context.close();
});

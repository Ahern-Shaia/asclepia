import { expect, type Page, test } from "@playwright/test";
import {
  asClient,
  fillInquiry,
  fullName,
  noHorizontalScroll,
  publishAll,
  type Seeded,
  seedShop,
  setStatus,
  sql,
} from "./support/shop";

// Inquiries through the real public Server Action (inquiry.md §4.2–4.3, OQ-INQ-1..5).
test.beforeEach(({ page }) => asClient(page));

const inquiriesFor = async (productId: string) =>
  (
    await sql<{ n: string }>(
      `select count(*)::text as n from "InquiryItem" where "productId" = $1`,
      [productId],
    )
  )[0].n;

async function addFromList(page: Page, seeded: Seeded) {
  await page.goto(`/products?cat=${seeded.category.id}`);
  for (const p of seeded.products) {
    const card = page
      .getByRole("listitem")
      .filter({ has: page.getByRole("link", { name: new RegExp(p.name) }) });
    await card.getByRole("button", { name: "加入詢價清單" }).click();
    await expect(card.getByRole("button", { name: "已在清單" })).toBeVisible();
  }
  await expect(
    page.getByRole("link", { name: `詢價清單 ${seeded.products.length} 件` }),
  ).toBeVisible();
}

test("詢價這件: one item, checked, really sent", async ({ page, context }) => {
  const seeded = await seedShop([{ name: "e2e-單件詢價", brand: "Beta", model: "S-1" }]);
  const [p] = seeded.products;
  await publishAll(page, context, seeded);

  await page.goto(`/products/${p.id}`);
  await page.getByRole("button", { name: "詢價這件" }).click();
  const dialog = page.getByRole("dialog", { name: "詢價這件" });
  await expect(dialog).toContainText(fullName(p));
  // the dialog is portalled out of the shop shell: its fields must still look like fields
  await expect(dialog.getByRole("textbox", { name: "姓名" })).toHaveCSS(
    "border-top-style",
    "solid",
  );
  await expect(dialog.getByRole("textbox", { name: /想了解什麼/ })).toHaveCSS(
    "border-top-style",
    "solid",
  );
  await expect(dialog.getByRole("button", { name: "送出詢價（1 件）" })).not.toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await dialog.getByRole("button", { name: "送出詢價（1 件）" }).click();
  await expect(dialog.getByText("請填寫姓名")).toBeVisible();
  await expect(dialog.getByText("請填寫聯絡電話，我們會用電話聯絡你")).toBeVisible();
  await expect(dialog.getByText("需要你同意，我們才能聯絡你")).toBeVisible();
  expect(await inquiriesFor(p.id)).toBe("0"); // nothing left the browser

  await fillInquiry(dialog);
  await dialog.getByRole("button", { name: "送出詢價（1 件）" }).click();
  await expect(dialog.getByRole("heading", { name: "已收到你的詢價（1 件）" })).toBeVisible();
  await expect(dialog.getByRole("listitem")).toHaveText([fullName(p)]);
  expect(await inquiriesFor(p.id)).toBe("1");
});

test("詢價清單: two items sent together, then the list is cleared", async ({ page, context }) => {
  const seeded = await seedShop([
    { name: "e2e-清單甲", brand: "Alpha", model: "Q-1", price: 88000 },
    { name: "e2e-清單乙", brand: "Gamma", model: "Q-2" },
  ]);
  const [a, b] = seeded.products;
  await publishAll(page, context, seeded);
  await addFromList(page, seeded);

  await page.goto("/inquiry");
  const rows = page.getByRole("list", { name: "詢價清單" }).getByRole("listitem");
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0)).toContainText("NT$ 88,000");
  await expect(rows.nth(1)).toContainText("歡迎詢價");
  await expect(page.locator("h1")).toHaveCount(1);
  await noHorizontalScroll(page);

  await fillInquiry(page);
  await page.getByRole("button", { name: "送出詢價（2 件）" }).click();
  const done = page.getByRole("status").filter({ hasText: "已收到你的詢價（2 件）" });
  await expect(done).toBeVisible();
  await expect(done.getByRole("listitem")).toHaveText([fullName(a), fullName(b)]);
  await expect(page.getByRole("link", { name: "詢價清單 0 件" })).toBeVisible();
  expect([await inquiriesFor(a.id), await inquiriesFor(b.id)]).toEqual(["1", "1"]);

  await page.reload();
  await expect(page.getByRole("heading", { name: "清單是空的" })).toBeVisible();
});

test("詢價清單: an item sold meanwhile blocks sending and is named", async ({ page, context }) => {
  const seeded = await seedShop([
    { name: "e2e-售出甲", brand: "Alpha", model: "X-1" },
    { name: "e2e-售出乙", brand: "Beta", model: "X-2" },
  ]);
  const [a, b] = seeded.products;
  await publishAll(page, context, seeded);
  await addFromList(page, seeded);
  await page.goto("/inquiry");
  await expect(page.getByRole("button", { name: "送出詢價（2 件）" })).toBeEnabled();

  // sold in the back office while the buyer has the list open: the endpoint refuses the whole
  // inquiry (OQ-INQ-5) and the page names the item
  const admin = await context.newPage();
  await setStatus(admin, context, b.id, "sell");
  await admin.close();
  await fillInquiry(page);
  await page.getByRole("button", { name: "送出詢價（2 件）" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    `${fullName(b)}已經無法詢價，請移除後再送出。`,
  );
  await expect(page.getByRole("button", { name: /送出詢價/ })).toBeDisabled();
  expect(await inquiriesFor(a.id)).toBe("0");

  // reloaded, the row says it is sold
  await page.reload();
  const rows = page.getByRole("list", { name: "詢價清單" }).getByRole("listitem");
  await expect(rows.filter({ hasText: b.name })).toContainText("已售出，送出時無法包含，請移除");
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    `${fullName(b)}已售出，請移除後再送出。`,
  );
  await expect(page.getByRole("button", { name: "送出詢價（1 件）" })).toBeDisabled();

  await page.getByRole("button", { name: `移除 ${fullName(b)}` }).click();
  await fillInquiry(page);
  await page.getByRole("button", { name: "送出詢價（1 件）" }).click();
  await expect(page.getByRole("heading", { name: "已收到你的詢價（1 件）" })).toBeVisible();
  expect(await inquiriesFor(a.id)).toBe("1");
  expect(await inquiriesFor(b.id)).toBe("0");
});

test("the 6th inquiry from one client within 10 minutes is refused with the message", async ({
  page,
  context,
}) => {
  test.setTimeout(120_000);
  const seeded = await seedShop([{ name: "e2e-限流", model: "R-1" }]);
  const [p] = seeded.products;
  await publishAll(page, context, seeded);

  // the limit is a fixed 10-minute window; don't straddle its edge
  const left = 600_000 - (Date.now() % 600_000);
  if (left < 60_000) await page.waitForTimeout(left + 1000);

  await page.goto(`/products/${p.id}`);
  const dialog = page.getByRole("dialog", { name: "詢價這件" });
  for (let i = 1; i <= 6; i++) {
    await page.getByRole("button", { name: "詢價這件" }).click();
    await fillInquiry(dialog, `e2e 第${i}次`);
    await dialog.getByRole("button", { name: "送出詢價（1 件）" }).click();
    if (i < 6) {
      await expect(dialog.getByRole("heading", { name: "已收到你的詢價（1 件）" })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  }
  await expect(dialog.getByRole("alert")).toHaveText(
    "短時間內送出太多次了。請 10 分鐘後再試，或直接來電。",
  );
  await expect(dialog.getByRole("button", { name: "送出詢價（1 件）" })).toBeEnabled();
  expect(await inquiriesFor(p.id)).toBe("5");
});

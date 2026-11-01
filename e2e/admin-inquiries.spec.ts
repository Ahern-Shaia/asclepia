import { expect, test } from "@playwright/test";
import { btn, uid } from "./support/admin";
import {
  asClient,
  fillInquiry,
  fullName,
  noHorizontalScroll,
  publishAll,
  seedShop,
  sql,
} from "./support/shop";

// Back-office inquiry records (inquiry.md B4): a buyer's inquiry arrives, staff handle it, and on
// the buyer's request delete it.
test.beforeEach(({ page }) => asClient(page));

test("an inquiry arrives, is handled and deleted", async ({ page, context }) => {
  test.setTimeout(120_000);
  const seeded = await seedShop([
    { name: "e2e-後台甲", brand: "Alpha", model: "K-1", price: 52000 },
    { name: "e2e-後台乙", brand: "Beta", model: "K-2" },
  ]);
  const [a, b] = seeded.products;
  const buyer = `e2e 買家${uid()}`;
  await publishAll(page, context, seeded); // also signs this context in

  // the buyer sends both together
  await page.goto(`/products?cat=${seeded.category.id}`);
  for (const p of [a, b])
    await page
      .getByRole("listitem")
      .filter({ has: page.getByRole("link", { name: new RegExp(p.name) }) })
      .getByRole("button", { name: "加入詢價清單" })
      .click();
  await page.goto("/inquiry");
  await fillInquiry(page, buyer);
  await page.getByLabel("想了解什麼").fill("週末可以看機嗎？");
  await page.getByRole("button", { name: "送出詢價（2 件）" }).click();
  await expect(page.getByRole("heading", { name: "已收到你的詢價（2 件）" })).toBeVisible();
  const [{ id }] = await sql<{ id: string }>(`select id from "Inquiry" where name = $1`, [buyer]);

  // the price changes after the buyer asked: the record keeps what they saw
  await sql(`update "Product" set "priceTwd" = 48000 where id = $1`, [a.id]);

  // list: newest first, first item + count, status 未處理
  await page.goto("/admin/inquiries");
  const row = page.getByRole("row").filter({ hasText: buyer });
  await expect(row).toContainText(fullName(a));
  await expect(row).toContainText("等 2 件");
  await expect(row).toContainText("未處理");
  await row.getByRole("link", { name: /^查看/ }).click();

  // detail: contact, message, both items as asked and as they are now
  await expect(page).toHaveURL(new RegExp(`/admin/inquiries/${id}$`));
  await expect(page.getByRole("heading", { level: 1, name: "詢價內容" })).toBeVisible();
  await expect(page.getByRole("link", { name: "02-1234-5678" })).toHaveAttribute(
    "href",
    "tel:02-1234-5678",
  );
  await expect(page.getByText("週末可以看機嗎？")).toBeVisible();
  const items = page
    .getByRole("listitem")
    .filter({ has: page.getByRole("link", { name: /開啟商品/ }) });
  await expect(items).toHaveCount(2);
  const first = items.filter({ hasText: fullName(a) });
  await expect(first).toContainText("NT$ 52,000"); // what the buyer saw
  await expect(first).toContainText("NT$ 48,000"); // what it is now
  await expect(first.getByText("已變更")).toBeVisible();
  await expect(items.filter({ hasText: fullName(b) }).getByText("已變更")).toHaveCount(0);
  await noHorizontalScroll(page);

  // handle it: status + internal note, saved and still there after a reload
  const save = page.getByRole("button", { name: btn("儲存") });
  await expect(save).toBeDisabled();
  await page.getByRole("combobox", { name: "狀態" }).click();
  await page.locator('.ant-select-item-option[title="已聯絡"]').click();
  await page.getByRole("textbox", { name: "內部備註" }).fill("已回電，約週二看機");
  await expect(page.getByText("有未儲存的變更")).toBeVisible();
  await save.click();
  await expect(page.getByText("已儲存。")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("textbox", { name: "內部備註" })).toHaveValue("已回電，約週二看機");
  await expect(page.getByRole("main").getByText("已聯絡").first()).toBeVisible();
  const [audit] = await sql<{ n: string }>(
    `select count(*)::text as n from "AuditLog" where "targetId" = $1 and action = 'inquiry.update'`,
    [id],
  );
  expect(audit.n).toBe("1");

  // the list filter finds it under 已聯絡
  await page.goto("/admin/inquiries?status=CONTACTED");
  await expect(page.getByRole("row").filter({ hasText: buyer })).toContainText("已聯絡");

  // delete on request: the dialog says what goes, that it can't be undone, and what stays
  await page.goto(`/admin/inquiries/${id}`);
  await page.getByRole("button", { name: "刪除這筆詢價" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("刪除後不能復原");
  await expect(dialog).toContainText("商品本身不受影響");
  await dialog.getByRole("button", { name: btn("刪除") }).click();
  await expect(page).toHaveURL(/\/admin\/inquiries$/);
  await expect(page.getByText("已刪除這筆詢價。")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: buyer })).toHaveCount(0);
  expect(await sql(`select 1 from "Inquiry" where id = $1`, [id])).toHaveLength(0);
  expect(await sql(`select 1 from "Product" where id = any($1)`, [[a.id, b.id]])).toHaveLength(2);

  await page.goto(`/admin/inquiries/${id}`);
  await expect(page.getByText("找不到這筆詢價，可能已經被刪除。")).toBeVisible();
});

test("signed out, the inquiry records are not readable", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/admin/inquiries");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByText("e2e 買家")).toHaveCount(0);
  await context.close();
});

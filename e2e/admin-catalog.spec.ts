import { expect, test } from "@playwright/test";
import {
  assign,
  btn,
  createAttribute,
  createCategory,
  newDraft,
  pick,
  saveNewDraft,
  signIn,
  uid,
} from "./support/admin";

// Back-office catalog against the real Server Actions (catalog.md A1, site-config.md §4.1).
test.beforeEach(async ({ context }) => signIn(context));

test("categories: create, refuse a duplicate, rename, delete", async ({ page }) => {
  const id = uid();
  const name = `e2e-分類${id}`;
  await createCategory(page, name);

  await page.getByRole("textbox", { name: "分類名稱" }).fill(name);
  await page.getByRole("button", { name: "新增分類" }).click();
  await expect(page.getByText("已經有同名的資料，請換一個名稱。")).toBeVisible();

  const renamed = `e2e-改名${id}`;
  await page.getByRole("button", { name: `把「${name}」改名` }).click();
  await page.getByRole("textbox", { name: `把「${name}」改名` }).fill(renamed);
  await page.getByRole("button", { name: btn("儲存") }).click();
  await expect(page.getByText(`已改名為「${renamed}」。`)).toBeVisible();
  await expect(page.getByRole("cell", { name: renamed, exact: true })).toBeVisible();

  await page.getByRole("button", { name: `刪除「${renamed}」` }).click();
  const dialog = page.getByRole("dialog", { name: `刪除「${renamed}」分類？` });
  await expect(dialog).toContainText("不會刪到任何商品");
  await dialog.getByRole("button", { name: btn("刪除") }).click();
  await expect(page.getByText(`已刪除「${renamed}」。`)).toBeVisible();
  await expect(page.getByRole("cell", { name: renamed, exact: true })).toHaveCount(0);
});

test("attributes: create one and tick it for a category", async ({ page }) => {
  const id = uid();
  const category = `e2e-欄位${id}`;
  const label = `型號${id}`;
  await createCategory(page, category);
  await createAttribute(page, label, `e2e_${id}`, "文字");
  await assign(page, category, label, ["組進標題"]);

  await page.reload();
  await pick(page, "分類", category);
  await expect(page.getByRole("checkbox", { name: `${label}：使用`, exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: `${label}：組進標題` })).toBeChecked();
  // a ticked attribute can't be deleted until every category unticks it
  await expect(page.getByRole("button", { name: `刪除「${label}」` })).toBeDisabled();
});

test("products: a draft with attributes shows its title in the list", async ({ page }) => {
  const id = uid();
  const category = `e2e-商品${id}`;
  const label = `型號${id}`;
  const name = `e2e-品名${id}`;
  await createCategory(page, category);
  await createAttribute(page, label, `e2e_${id}`, "文字");
  await assign(page, category, label, ["組進標題"]);

  await newDraft(page, category, name);
  await page.getByRole("textbox", { name: label }).fill("VA-1842");
  await expect(page.getByTestId("title-preview")).toHaveText("VA-1842");
  await saveNewDraft(page);
  await expect(page.getByText("已建立草稿。")).toBeVisible();
  await expect(page.getByRole("textbox", { name: label })).toHaveValue("VA-1842");

  await page.goto(`/admin/products?q=${encodeURIComponent(name)}`);
  const row = page.getByRole("row", { name: new RegExp(name) });
  await expect(row.getByRole("link", { name: "VA-1842", exact: true })).toBeVisible();
  await expect(row).toContainText(category);
  await expect(row).toContainText("草稿");
  await expect(row).toContainText("歡迎詢價");

  await page.locator(".ant-segmented").getByText("上架中", { exact: true }).click();
  await expect(page).toHaveURL(/status=PUBLISHED/);
  await expect(page.getByText("沒有符合條件的商品")).toBeVisible();
});

test("products: an invalid year is reported at the field", async ({ page }) => {
  const id = uid();
  const category = `e2e-年份${id}`;
  const label = `年份${id}`;
  await createCategory(page, category);
  await createAttribute(page, label, `e2e_${id}`, "年份");
  await assign(page, category, label);

  await newDraft(page, category, `e2e-品名${id}`);
  await page.getByRole("spinbutton", { name: label }).fill("1800");
  await page.getByRole("button", { name: "存草稿" }).click();
  const max = new Date().getFullYear() + 1;
  const item = page.locator(".ant-form-item", {
    has: page.getByRole("spinbutton", { name: label }),
  });
  await expect(item).toContainText(`「${label}」要填 1950 到 ${max} 之間的西元年`);
  await expect(page.getByRole("spinbutton", { name: label })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(page.getByText("有欄位需要修正，請看標紅的地方。")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/products\/new$/);
});

test("products: publishing lists what is missing, including a photo", async ({ page }) => {
  const id = uid();
  const category = `e2e-上架${id}`;
  await createCategory(page, category);
  await newDraft(page, category, "");
  await page.getByRole("button", { name: btn("上架") }).click();
  await expect(page).toHaveURL(/\/admin\/products\/(?!new)[a-z0-9]+$/);
  const alert = page.getByRole("alert").filter({ hasText: "還有項目沒完成，暫時無法上架。" });
  await expect(alert).toContainText("品名");
  await expect(alert).toContainText("至少一張商品照片");
  // Next keeps the /new page mounted but hidden after router.replace, hence visible-only
  const status = page.getByText("目前狀態").filter({ visible: true }).locator("..");
  await expect(status).toContainText("草稿");
});

test("products: an efficacy word warns after saving but still saves", async ({ page }) => {
  const id = uid();
  const category = `e2e-療效${id}`;
  await createCategory(page, category);
  await newDraft(page, category, `e2e-品名${id}`);
  await page.getByRole("textbox", { name: "產品訊息第 1 行" }).fill("可緩解久坐疲勞");
  await saveNewDraft(page);
  const warning = "「緩解」是醫療效果的說法";
  await expect(page.getByRole("alert").filter({ hasText: warning })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "產品訊息第 1 行" })).toHaveValue(
    "可緩解久坐疲勞",
  );

  // saving an existing product warns too
  await page.getByRole("button", { name: "存草稿" }).click();
  await expect(page.getByText("已存檔。")).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: warning })).toBeVisible();
});

test("products: a stale save is refused and can be reloaded", async ({ page, context }) => {
  const id = uid();
  const category = `e2e-衝突${id}`;
  await createCategory(page, category);
  await newDraft(page, category, `e2e-品名${id}`);
  await saveNewDraft(page);

  const other = await context.newPage();
  await other.goto(page.url());
  const name = (p: typeof page) => p.getByRole("textbox", { name: /^品名/ });
  await expect(name(other)).toHaveValue(`e2e-品名${id}`);

  await name(page).fill(`e2e-第一頁${id}`);
  await page.getByRole("button", { name: "存草稿" }).click();
  await expect(page.getByText("已存檔。")).toBeVisible();

  await name(other).fill(`e2e-第二頁${id}`);
  await other.getByRole("button", { name: "存草稿" }).click();
  await expect(other.getByText("這筆資料剛被別人改過")).toBeVisible();
  await other.getByRole("button", { name: "重新載入" }).click();
  await expect(name(other)).toHaveValue(`e2e-第一頁${id}`);
  await expect(other.getByText("這筆資料剛被別人改過")).toHaveCount(0);
});

test("products: a draft can be deleted after a confirmation", async ({ page }) => {
  const id = uid();
  const category = `e2e-刪除${id}`;
  await createCategory(page, category);
  await newDraft(page, category, `e2e-品名${id}`);
  await saveNewDraft(page);
  await page.getByRole("button", { name: "刪除草稿" }).click();
  const dialog = page.getByRole("dialog", { name: "刪除這件草稿？" });
  await expect(dialog).toContainText("不會動到分類");
  await dialog.getByRole("button", { name: btn("刪除") }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByText("已刪除草稿。")).toBeVisible();
});

test("admin pages have no horizontal page scroll", async ({ page }) => {
  for (const path of [
    "/admin/products",
    "/admin/products/new",
    "/admin/categories",
    "/admin/attributes",
  ]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, path).toBe(false);
  }
});

test("the real admin menu links only to built sections", async ({ page }) => {
  await page.goto("/admin/products");
  const nav = page.viewportSize()!.width < 769 ? null : page.locator(".ant-layout-sider");
  if (!nav) await page.getByRole("button", { name: "開啟選單" }).click();
  const menu = nav ?? page.getByRole("dialog");
  await expect(menu.getByRole("link", { name: "分類" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "商品欄位" })).toBeVisible();
  await expect(menu.getByText("詢價紀錄")).toHaveCount(0);
  await expect(menu.getByText("站台設定")).toHaveCount(0);
});

import { type BrowserContext, expect, type Page } from "@playwright/test";
import { E2E_AUTH } from "../../playwright.config";
import { signInAs } from "./session";

// The e2e database persists between runs and both projects run in parallel: every spec creates
// its own uniquely named data ("e2e-…"; removed by teardown.ts).
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// antd puts a space between the two characters of a two-character CJK button ("儲 存").
export const btn = (label: string) =>
  [...label].length === 2 ? new RegExp(`^${[...label].join(" ?")}$`) : label;

export const signIn = (context: BrowserContext) => signInAs(context, E2E_AUTH.admin);

// antd Select with search: type to filter, Enter picks the first match.
export async function pick(page: Page, combobox: string, option: string) {
  const box = page.getByRole("combobox", { name: combobox, exact: true });
  await box.click();
  await box.fill(option);
  await page.locator(".ant-select-item-option-active", { hasText: option }).waitFor();
  await page.keyboard.press("Enter");
}

export async function createCategory(page: Page, name: string) {
  await page.goto("/admin/categories");
  await page.getByRole("textbox", { name: "分類名稱" }).fill(name);
  await page.getByRole("button", { name: "新增分類" }).click();
  await expect(page.getByRole("cell", { name, exact: true })).toBeVisible();
}

type AttrType = "文字" | "數字" | "年份" | "選項";

export async function createAttribute(page: Page, label: string, key: string, type: AttrType) {
  await page.goto("/admin/attributes");
  await page.getByRole("button", { name: "新增欄位" }).click();
  const drawer = page.getByRole("dialog", { name: "新增欄位" });
  await drawer.getByLabel("名稱", { exact: true }).fill(label);
  await drawer.getByLabel("代號", { exact: true }).fill(key);
  if (type !== "文字") {
    await drawer.getByRole("combobox", { name: "類型" }).click();
    await page.locator(`.ant-select-item-option[title="${type}"]`).click();
  }
  await drawer.getByRole("button", { name: "建立欄位" }).click();
  await expect(page.getByText(`已建立「${label}」`)).toBeVisible();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("cell", { name: key, exact: true })).toBeVisible();
}

// On /admin/attributes: tick the attribute for the category, plus the given flags, and save.
export async function assign(page: Page, category: string, label: string, flags: string[] = []) {
  await pick(page, "分類", category);
  for (const flag of ["使用", ...flags])
    await page.getByRole("checkbox", { name: `${label}：${flag}`, exact: true }).check();
  await page.getByRole("button", { name: `儲存「${category}」的設定` }).click();
  await expect(page.getByText(`已儲存「${category}」的設定`)).toBeVisible();
}

export async function newDraft(page: Page, category: string, name: string) {
  await page.goto("/admin/products/new");
  await pick(page, "分類", category);
  await page.getByRole("textbox", { name: /^品名/ }).fill(name);
}

export async function saveNewDraft(page: Page) {
  await page.getByRole("button", { name: "存草稿" }).click();
  await expect(page).toHaveURL(/\/admin\/products\/(?!new)[a-z0-9]+$/);
  await expect(page.getByRole("heading", { level: 1, name: "編輯商品" })).toBeVisible();
}

import { expect, test } from "@playwright/test";
import { E2E_AUTH } from "../playwright.config";
import { signInAs } from "./support/session";

// Back-office boundary (catalog.md A4, stack-rules S4-1 / S4-3).
test("signed-out visitors are sent to the login page", async ({ page }) => {
  for (const path of ["/admin", "/admin/products"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
  await expect(page.getByRole("heading", { level: 1, name: "登入後台" })).toBeVisible();
  await expect(page.getByRole("button", { name: "使用 Google 帳號登入" })).toBeVisible();
});

test("a refused Google account sees why", async ({ page }) => {
  await page.goto("/admin/login?error=AccessDenied");
  await expect(page.getByText("這個 Google 帳號沒有後台權限")).toBeVisible();
});

test("an allowlisted admin reaches the back office", async ({ page, context }) => {
  await signInAs(context, E2E_AUTH.admin);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByRole("heading", { level: 1, name: "商品管理" })).toBeVisible();
  // already signed in: the login page sends you back in
  await page.goto("/admin/login");
  await expect(page).toHaveURL(/\/admin\/products$/);
});

test("a valid session for an address not on the list is refused", async ({ page, context }) => {
  await signInAs(context, "former-staff@example.com");
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("an expired session is refused", async ({ page, context }) => {
  await signInAs(context, E2E_AUTH.admin, -60);
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

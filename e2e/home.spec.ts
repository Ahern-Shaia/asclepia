import { expect, test } from "@playwright/test";

test("home renders the site shell in Traditional Chinese", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant-TW");
  await expect(page.getByRole("link", { name: "Asclepia" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "中古院所與檢驗設備" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("© Asclepia");
});

test("home has no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

// "Rendered" is not "laid out": these caught a CSS-specificity bug the role checks above missed.
test("header brand aligns with page content", async ({ page }) => {
  await page.goto("/");
  const brand = await page.getByTestId("brand").boundingBox();
  const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
  expect(brand && heading).toBeTruthy();
  expect(Math.abs(brand!.x - heading!.x)).toBeLessThanOrEqual(1);
});

test("footer sits at the bottom of a short page", async ({ page }) => {
  await page.goto("/");
  const footer = await page.getByRole("contentinfo").boundingBox();
  const viewport = page.viewportSize()!;
  expect(footer).toBeTruthy();
  expect(Math.abs(footer!.y + footer!.height - viewport.height)).toBeLessThanOrEqual(1);
});

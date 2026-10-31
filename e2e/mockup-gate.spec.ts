import { expect, test } from "@playwright/test";

// Mockups carry fake licence numbers; they must never be served by a production build
// unless ENABLE_MOCKUPS=1 is set explicitly (src/app/mockup/layout.tsx).
for (const path of [
  "/mockup",
  "/mockup/site",
  "/mockup/site/products/p1",
  "/mockup/admin/products",
]) {
  test(`production build hides ${path}`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.getByText("MOCKUP")).toHaveCount(0);
  });
}

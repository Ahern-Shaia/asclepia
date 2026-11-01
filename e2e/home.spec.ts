import { expect, test } from "@playwright/test";
import { fullName, noHorizontalScroll, publishAll, seedShop } from "./support/shop";

// The real home page (§B0 inspect-catalog; baseline /mockup/site-v5-1).
test("home: shell in Traditional Chinese, one h1, one search, no mockup banner", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant-TW");
  await expect(page.getByRole("link", { name: "Asclepia 首頁" })).toBeVisible();
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("看過實機再決定");
  // §B0: the hero search is the only search on the home page (header has none)
  await expect(page.getByRole("search").filter({ visible: true })).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toContainText("© Asclepia");
  await expect(page.getByText("MOCKUP")).toHaveCount(0);
  await expect(page.getByText("倉庫實景照")).toHaveCount(0); // mockup photo placeholder
  await noHorizontalScroll(page);
});

test("home: a just-published product shows in 最新上架 and its category tile", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([
    { name: "e2e-首頁商品", brand: "Alpha", model: "H-1", year: 2019, firstInLatest: true },
  ]);
  const [p] = seeded.products;
  await publishAll(page, context, seeded);

  await page.goto("/");
  const latest = page.getByRole("region", { name: "最新上架" });
  const card = latest.getByRole("link", { name: new RegExp(p.name) });
  await expect(card).toBeVisible();
  await expect(card).toContainText("H-1");
  await expect(card.getByRole("img", { name: fullName(p) })).toHaveAttribute(
    "src",
    /^\/media\/img_[0-9a-f]{32}-400\.webp$/,
  );
  await expect(
    page.getByRole("region", { name: "設備分類" }).getByRole("link", {
      name: new RegExp(seeded.category.name),
    }),
  ).toContainText("1 件");

  // the hero search sends cat + q to the list page
  await page.getByRole("combobox", { name: "分類" }).selectOption(seeded.category.id);
  await page.getByRole("searchbox").filter({ visible: true }).fill("H-1");
  await page.getByRole("button", { name: "搜尋" }).click();
  await expect(page).toHaveURL(new RegExp(`/products\\?cat=${seeded.category.id}&q=H-1$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("共 1 件");
});

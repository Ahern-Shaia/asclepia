import { expect, type Page, test } from "@playwright/test";
import { fullName, noHorizontalScroll, publishAll, seedShop, setStatus } from "./support/shop";

// Public list and product pages against the real catalog reads (catalog.md A3, §B0).

// Desktop has the filter column; narrower screens open the same panel in a bottom drawer.
async function filterPanel(page: Page) {
  const open = page.getByRole("button", { name: /^篩選/ });
  if (await open.isVisible()) {
    await open.click();
    return page.getByRole("dialog", { name: "篩選" });
  }
  return page.getByRole("complementary", { name: "篩選" });
}

const cards = (page: Page) =>
  page.getByRole("main").getByRole("link").filter({ hasText: "e2e-離心機" });

test("list: attribute filter, keyword and price sort run on the server", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([
    { name: "e2e-離心機甲", brand: "Alpha", model: "LA-300", price: 300000 },
    { name: "e2e-離心機乙", brand: "Beta", model: "LB-120", price: 120000 },
    { name: "e2e-離心機丙", brand: "Alpha", model: "LC-000" }, // 歡迎詢價
  ]);
  const [a, b, c] = seeded.products;
  await publishAll(page, context, seeded);
  const cat = seeded.category.id;

  await page.goto(`/products?cat=${cat}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    `${seeded.category.name}共 3 件`,
  );

  // filter by an attribute value: the URL carries it and the server answers
  const panel = await filterPanel(page);
  await panel.getByRole("checkbox", { name: /^Alpha/ }).check();
  await expect(page).toHaveURL(new RegExp(`f\\.${seeded.keys.brand}=Alpha`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("共 2 件");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: new RegExp(b.name) })).toHaveCount(0);
  await expect(page.getByRole("link", { name: new RegExp(a.name) })).toBeVisible();

  // keyword (matches a text attribute, not only the name)
  await page.goto(`/products?cat=${cat}&q=LB-120`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("「LB-120」的搜尋結果共 1 件");
  await expect(page.getByRole("link", { name: new RegExp(b.name) })).toBeVisible();

  // price low → high; 歡迎詢價 last
  await page.goto(`/products?cat=${cat}`);
  await page.getByRole("combobox", { name: "排序" }).selectOption("priceAsc");
  await expect(page).toHaveURL(/sort=priceAsc/);
  await expect(cards(page)).toHaveText([b.name, a.name, c.name].map((n) => new RegExp(n)));
  await expect(page.getByRole("link", { name: new RegExp(c.name) })).toContainText("歡迎詢價");

  await noHorizontalScroll(page);
  await expect(page.locator("h1")).toHaveCount(1);
});

test("list: no match shows the empty state, not an empty grid", async ({ page }) => {
  await page.goto(`/products?q=${encodeURIComponent("不會有這個字e2e")}`);
  await expect(page.getByRole("heading", { name: "沒有符合的商品" })).toBeVisible();
  await expect(page.getByRole("link", { name: "看全部商品" })).toBeVisible();
});

test("product page: nameplate, specs and photos; thumbnails switch the main photo", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([
    {
      name: "e2e-生化分析儀",
      brand: "Gamma",
      model: "GX-9",
      year: 2018,
      price: 450000,
      highlights: ["附原廠操作手冊", "含試劑盤一組"],
      specs: [
        ["電源", "AC 110V"],
        ["重量", "38 kg"],
      ],
      photos: 3,
    },
  ]);
  const [p] = seeded.products;
  await publishAll(page, context, seeded);

  await page.goto(`/products/${p.id}`);
  await expect(page).toHaveTitle(`${fullName(p)}｜Asclepia`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "附原廠操作手冊；含試劑盤一組",
  );
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Gamma GX-9${p.name}`);
  await expect(page.getByText("NT$ 450,000")).toBeVisible();

  const plate = page.getByRole("region", { name: "設備銘牌" });
  await expect(plate).toContainText("廠牌Gamma");
  await expect(plate).toContainText("型號GX-9");
  await expect(plate).toContainText("年份2018 年");
  const specs = page.getByRole("region", { name: "規格", exact: true });
  await expect(specs).toContainText("電源AC 110V");
  await expect(specs).toContainText("重量38 kg");
  await expect(page.getByRole("region", { name: "產品訊息" })).toContainText("含試劑盤一組");

  // one large photo (1600) at a time; thumbnails are the 400 files
  const main = page.locator('img[src$="-1600.webp"]');
  await expect(main).toHaveCount(1);
  await expect(main).toHaveAttribute("alt", `${fullName(p)} 主圖`);
  const first = await main.getAttribute("src");
  const thumbs = page.getByRole("list", { name: "商品照片" });
  await expect(thumbs.getByRole("button")).toHaveCount(3);
  await expect(thumbs.locator('img[src$="-400.webp"]')).toHaveCount(3);
  await thumbs.getByRole("button", { name: "看第 2 張照片" }).click();
  await expect(main).toHaveAttribute("alt", `${fullName(p)} 照片 2`);
  const second = await main.getAttribute("src");
  expect(second).not.toBe(first);
  expect((await page.request.get(second!)).status()).toBe(200);
  await expect(page.getByRole("button", { name: "看第 2 張照片" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  // the one-tap and the list action sit next to each other (§B0 商品頁)
  await expect(page.getByRole("button", { name: "詢價這件" })).toBeInViewport();
  await noHorizontalScroll(page);
});

test("drafts are never public; a hidden product is gone right after hiding", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([
    { name: "e2e-草稿品", model: "DR-1" },
    { name: "e2e-將下架品", model: "HD-1" },
  ]);
  const [draft, hidden] = seeded.products;
  await setStatus(page, context, hidden.id, "publish");

  // a draft's URL answers like an unknown id (S4-4)
  await page.goto(`/products/${draft.id}`);
  await expect(page.getByRole("heading", { level: 1, name: "找不到這件商品" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  await page.goto(`/products?q=DR-1`);
  await expect(page.getByRole("heading", { name: "沒有符合的商品" })).toBeVisible();

  await page.goto(`/products/${hidden.id}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(hidden.name);

  // hide in the back office → the same URL is not found on the very next request (P7-3)
  await setStatus(page, context, hidden.id, "hide");
  await page.goto(`/products/${hidden.id}`);
  await expect(page.getByRole("heading", { level: 1, name: "找不到這件商品" })).toBeVisible();
  await expect(page.getByText(hidden.name)).toHaveCount(0);
  await page.goto(`/products?cat=${seeded.category.id}`);
  await expect(page.getByRole("heading", { name: "沒有符合的商品" })).toBeVisible();
});

test("malformed product ids are not found", async ({ page }) => {
  for (const id of ["NOT-AN-ID", "x".repeat(41)]) {
    await page.goto(`/products/${id}`);
    await expect(page.getByRole("heading", { level: 1, name: "找不到這件商品" })).toBeVisible();
  }
});

// User 2026-11-01: the store's statements (warranty, invoice, delivery, services, "自有庫存") are
// not shown by default; the back office sets them (site-config notes.ts). Nothing is set here.
test("store statements are absent until the back office sets them", async ({ page, context }) => {
  const seeded = await seedShop([{ name: "e2e-說明", brand: "Alpha", model: "N-1" }]);
  await publishAll(page, context, seeded);
  const claims = /自有庫存|可預約看機|到場拆裝|拆裝運送|可開立發票|免費維修|收購|租賃/;

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "也可以找我們" })).toHaveCount(0);
  await expect(page.getByRole("main")).not.toContainText(claims);

  await page.goto(`/products/${seeded.products[0].id}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("e2e-說明");
  await expect(page.getByRole("heading", { name: "保固與交易說明" })).toHaveCount(0);
  await expect(page.getByRole("main")).not.toContainText(claims);
});

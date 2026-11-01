import { expect, type Page, test } from "@playwright/test";
import sharp from "sharp";
import { themePresets } from "../src/theme/tokens";
import { btn, signIn } from "./support/admin";
import { asClient, noHorizontalScroll, publishAll, seedShop, sql } from "./support/shop";

// 站台設定 (site-config.md §4.2, §4.5-bis). Runs in its own project after every other spec
// (playwright.config.ts SITE_WIDE): the settings are one document for the whole site.
test.describe.configure({ mode: "serial" });
test.beforeEach(({ page }) => asClient(page));

type Tab = "店家資料" | "文案與說明" | "主題" | "首頁區塊" | "功能開關" | "圖片";
const PHONE = "02-2345-6789";
const SAVE = /儲 ?存$/; // the button has an icon: its name is "save 儲存"

async function openTab(page: Page, tab: Tab) {
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

  const panel = await openTab(page, "文案與說明");
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
  const again = await openTab(page, "文案與說明");
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

const pageVar = (page: Page, name: string) =>
  page.evaluate(
    (n) => getComputedStyle(document.querySelector("[class*=page]")!).getPropertyValue(n),
    name,
  );

async function restore(page: Page, tab: Tab) {
  const panel = await openTab(page, tab);
  await panel.getByRole("button", { name: /還原上一版/ }).click();
  await page
    .getByRole("dialog", { name: "還原上一版？" })
    .getByRole("button", { name: btn("還原") })
    .click();
  await expect(page.getByText("已還原上一版，前台已更新。")).toBeVisible();
}

test("theme: a preset is applied to the public site; an unreadable colour can't be saved", async ({
  page,
  context,
}) => {
  await signIn(context);
  const forest = themePresets.find((p) => p.id === "forest")!;
  const panel = await openTab(page, "主題");
  await noHorizontalScroll(page);

  // a light yellow primary: the gate names the pair and save stays off
  await panel.getByRole("textbox", { name: /^主色/ }).fill("#FFF59D");
  await expect(panel.getByRole("alert").first()).toContainText("主色上的白字");
  await expect(panel.getByRole("button", { name: SAVE })).toBeDisabled();

  await panel.getByRole("radio", { name: /森林綠＋磚紅/ }).check();
  await panel.getByText("大（10px）").click();
  await expect(panel.getByRole("button", { name: SAVE })).toBeEnabled();
  await panel.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();

  await page.goto("/");
  expect((await pageVar(page, "--navy")).trim()).toBe(forest.primary);
  expect((await pageVar(page, "--accent")).trim()).toBe(forest.accent);
  expect((await pageVar(page, "--radius")).trim()).toBe("10px");

  await restore(page, "主題");
  await page.goto("/");
  expect((await pageVar(page, "--navy")).trim()).toBe(themePresets[0].primary);
});

test("home blocks: switched off and reordered on the public home page", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([{ name: "e2e-首頁", brand: "Alpha", model: "H-1" }]);
  await publishAll(page, context, seeded);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "最新上架" })).toBeVisible();

  const panel = await openTab(page, "首頁區塊");
  await panel.getByRole("switch", { name: "最新上架" }).click();
  for (let i = 0; i < 3; i++)
    await panel.getByRole("button", { name: "怎麼買＋看機地點 往上移" }).click();
  await panel.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "最新上架" })).toHaveCount(0);
  const order = await page.getByRole("main").getByRole("heading", { level: 2 }).allTextContents();
  expect(order[0]).toBe("怎麼買");

  await restore(page, "首頁區塊");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "最新上架" })).toBeVisible();
});

test("images: logo and hero photo are uploaded, shown on the public site, and removed", async ({
  page,
  context,
}) => {
  await signIn(context);
  const png = await sharp({
    create: { width: 600, height: 200, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .png()
    .toBuffer();
  const jpeg = await sharp({
    create: { width: 2400, height: 1350, channels: 3, background: { r: 90, g: 110, b: 130 } },
  })
    .jpeg()
    .toBuffer();

  const panel = await openTab(page, "圖片");
  await noHorizontalScroll(page);
  // not an image: refused before anything is sent
  await panel
    .getByLabel("選擇店家 logo檔案")
    .setInputFiles({ name: "logo.txt", mimeType: "text/plain", buffer: Buffer.from("hi") });
  await expect(panel.getByRole("alert").first()).toBeVisible();

  await panel
    .getByLabel("選擇店家 logo檔案")
    .setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: png });
  await expect(page.getByText("已更新店家 logo，前台已更新。")).toBeVisible();
  await panel
    .getByLabel("選擇首頁主照片檔案")
    .setInputFiles({ name: "hero.jpg", mimeType: "image/jpeg", buffer: jpeg });
  await expect(page.getByText("已更新首頁主照片，前台已更新。")).toBeVisible();

  await page.goto("/");
  const logo = page.getByRole("banner").getByRole("link", { name: /首頁$/ }).locator("img");
  await expect(logo).toHaveAttribute("src", /^\/media\/img_[0-9a-f]{32}-400\.webp$/);
  await expect(logo).toHaveAttribute("alt", "Asclepia");
  const hero = page.locator("section[aria-labelledby=hero-title] > img");
  await expect(hero).toHaveCount(1);
  expect(await hero.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBe(1600);

  for (const label of ["店家 logo", "首頁主照片"]) {
    const p = await openTab(page, "圖片");
    await p.getByRole("button", { name: /移除$/ }).first().click();
    const dialog = page.getByRole("dialog", { name: `移除${label}？` });
    await expect(dialog).toContainText("刪除後不能復原");
    await dialog.getByRole("button", { name: btn("移除") }).click();
    await expect(page.getByText(`已移除${label}，前台已更新。`)).toBeVisible();
  }
  await page.goto("/");
  await expect(page.getByRole("banner").locator("img")).toHaveCount(0);
  await expect(page.locator("section[aria-labelledby=hero-title] > img")).toHaveCount(0);
});

test("features: prices hidden even from the page data, no inquiry list, custom visit label", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([{ name: "e2e-開關", brand: "Alpha", model: "F-1", price: 87654 }]);
  await publishAll(page, context, seeded); // also signs in
  const product = `/products/${seeded.products[0].id}`;
  // a phone number makes the visit button show
  const profile = await openTab(page, "店家資料");
  await profile.getByLabel("電話").fill("02-2222-3333");
  await profile.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();

  const panel = await openTab(page, "功能開關");
  await panel.getByRole("switch", { name: "顯示價格" }).click();
  await panel.getByRole("switch", { name: "詢價清單" }).click();
  await panel.getByLabel("預約按鈕文字").fill("預約看貨");
  await panel.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();

  await page.goto(product);
  await expect(page.getByText("歡迎詢價").first()).toBeVisible();
  expect(await page.content()).not.toContain("87654"); // not in the HTML nor the RSC payload
  expect(await page.content()).not.toContain("87,654");
  await expect(page.getByRole("button", { name: /加入詢價清單/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "詢價這件" })).toBeVisible();
  await expect(page.getByRole("link", { name: /預約看貨/ }).first()).toBeAttached();
  await page.goto(`/products?cat=${seeded.category.id}&sort=priceAsc`);
  await expect(page.getByRole("combobox", { name: "排序" })).toHaveCount(0);
  expect(await page.content()).not.toContain("87654");
  await page.goto("/inquiry");
  await expect(page.getByRole("heading", { name: "詢價清單" })).toHaveCount(0);

  await restore(page, "功能開關");
  await restore(page, "店家資料");
  await page.goto(product);
  await expect(page.getByText("NT$ 87,654").first()).toBeVisible();
  // positive control for the "not in the page data" checks above: the same probe finds it now
  expect(await page.content()).toContain("87654");
  await expect(page.getByRole("button", { name: /加入詢價清單/ })).toBeVisible();
});

test("texts: hero heading, a buy step and the footer line follow the back office", async ({
  page,
  context,
}) => {
  await signIn(context);
  const panel = await openTab(page, "文案與說明");
  await panel.getByLabel("第 1 行").fill("e2e 二手設備");
  await panel.getByLabel("第 2 行").fill("");
  await panel.getByLabel("第 1 步標題").fill("e2e 來電");
  await panel.getByLabel("頁尾一句話（選填）").fill("e2e 週日公休");
  await panel.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("e2e 二手設備");
  await expect(page.getByText("e2e 來電")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("e2e 週日公休");

  await restore(page, "文案與說明");
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("看過實機再決定");
  await expect(page.getByRole("contentinfo")).not.toContainText("e2e 週日公休");
});

test("visit photo, favicon, brand logo, map link and search description reach the public site", async ({
  page,
  context,
}) => {
  const seeded = await seedShop([{ name: "e2e-品牌", brand: "Beta", model: "B-1" }]);
  // the home 「依品牌找」 and the brand-logo list read the attribute keyed `brand` (catalog
  // publicBrands); seeded attributes use e2e_ keys, so give this category the real key too
  const [{ id: brandDef }] = await sql<{ id: string }>(
    `insert into "AttributeDef" (id, key, label, type, options, "updatedAt")
     values ('e2e-brand-def', 'brand', '品牌', 'TEXT', '{}', now())
     on conflict (key) do update set key = excluded.key returning id`,
  );
  await sql(
    `insert into "CategoryAttribute" ("categoryId", "attributeId", "sortOrder") values ($1, $2, 99)`,
    [seeded.category.id, brandDef],
  );
  await sql(`update "Product" set attributes = attributes || '{"brand":"Beta"}' where id = $1`, [
    seeded.products[0].id,
  ]);
  await publishAll(page, context, seeded); // also signs in (and expires the catalog cache)
  const photo = (w: number, h: number) =>
    sharp({ create: { width: w, height: h, channels: 3, background: { r: 120, g: 140, b: 160 } } })
      .jpeg()
      .toBuffer();
  const map = "https://maps.app.goo.gl/e2eExample";

  const profile = await openTab(page, "店家資料");
  await profile.getByLabel("地址").fill("台北市範例路 9 號");
  await profile.getByLabel("地圖連結").fill("not a link");
  await profile.getByRole("button", { name: SAVE }).click();
  await expect(profile.getByText("請貼上以 https:// 開頭的連結。")).toBeVisible();
  await profile.getByLabel("地圖連結").fill(map);
  await profile.getByLabel("搜尋結果的網站描述").fill("e2e 中古設備，看機後成交。");
  await profile.getByRole("button", { name: SAVE }).click();
  await expect(page.getByText("已儲存，前台已更新。")).toBeVisible();

  const images = await openTab(page, "圖片");
  await images
    .getByLabel("選擇看機區照片檔案")
    .setInputFiles({ name: "v.jpg", mimeType: "image/jpeg", buffer: await photo(1200, 900) });
  await expect(page.getByText("已更新看機區照片，前台已更新。")).toBeVisible();
  await images
    .getByLabel("選擇瀏覽器分頁小圖示檔案")
    .setInputFiles({ name: "f.jpg", mimeType: "image/jpeg", buffer: await photo(600, 400) });
  await expect(page.getByText("已更新瀏覽器分頁小圖示，前台已更新。")).toBeVisible();
  await images
    .getByLabel("選擇Beta檔案")
    .setInputFiles({ name: "b.jpg", mimeType: "image/jpeg", buffer: await photo(600, 200) });
  await expect(page.getByText("已更新Beta，前台已更新。")).toBeVisible();

  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "e2e 中古設備，看機後成交。",
  );
  const icon = page.locator('link[rel="icon"][sizes="32x32"]');
  await expect(icon).toHaveAttribute("href", /-32\.png$/);
  const res = await page.request.get((await icon.getAttribute("href"))!);
  expect([res.status(), res.headers()["content-type"]]).toEqual([200, "image/png"]);
  const visit = page.getByRole("complementary", { name: "看機地點" });
  await expect(visit.locator("img")).toHaveAttribute("src", /-1600\.webp$/);
  await expect(visit.getByRole("link", { name: "開啟地圖" })).toHaveAttribute("href", map);
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "開啟地圖" }),
  ).toHaveAttribute("target", "_blank");
  const brands = page.getByRole("region", { name: "依品牌找" });
  await expect(
    brands.getByRole("link", { name: "Beta", exact: true }).locator("img"),
  ).toHaveAttribute("alt", "Beta");

  // clean up: images removed, store details restored
  const again = await openTab(page, "圖片");
  for (const label of ["看機區照片", "瀏覽器分頁小圖示", "Beta"]) {
    await again.getByRole("button", { name: /移除$/ }).first().click();
    await page
      .getByRole("dialog", { name: `移除${label}？` })
      .getByRole("button", { name: btn("移除") })
      .click();
    await expect(page.getByText(`已移除${label}，前台已更新。`)).toBeVisible();
  }
  await restore(page, "店家資料");
  await page.goto("/");
  await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveCount(0);
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

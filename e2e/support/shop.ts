import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type BrowserContext, expect, type Locator, type Page } from "@playwright/test";
import { Client } from "pg";
import sharp from "sharp";
import { E2E_CLIENT_HEADER, E2E_UPLOAD_DIR, e2eDatabaseUrl } from "../../playwright.config";
import { btn, signIn, uid } from "./admin";

// Storefront fixtures. Drafts (category, attributes, products, photos) are written straight into
// the e2e database — fast and deterministic. Every status change then goes through the real
// back office, so the public pages are invalidated the way an admin's click invalidates them
// (updateTag 'catalog' / 'product:<id>'); nothing here touches the cache directly.

export async function sql<T = Record<string, unknown>>(text: string, values: unknown[] = []) {
  const db = new Client({ connectionString: e2eDatabaseUrl });
  await db.connect();
  try {
    return (await db.query(text, values)).rows as T[];
  } finally {
    await db.end();
  }
}

// Each spec gets its own rate-limit bucket (src/server/action.ts reads E2E_CLIENT_HEADER in e2e).
export const asClient = (page: Page, value = uid()) =>
  page.setExtraHTTPHeaders({ [E2E_CLIENT_HEADER]: `e2e-${value}` });

type SeedProduct = {
  name: string;
  brand?: string; // SELECT, filterable, in the title
  model?: string; // TEXT, in the title
  year?: number; // YEAR, on the card and nameplate
  price?: number | null;
  highlights?: string[];
  specs?: [string, string][];
  photos?: number;
  firstInLatest?: boolean; // publishedAt in the future: stays first in 最新上架 while specs run
};

export type Seeded = {
  category: { id: string; name: string };
  keys: { brand: string; model: string; year: string };
  products: (SeedProduct & { id: string; title: string })[];
};

const BRANDS = ["Alpha", "Beta", "Gamma"];

const photo = (w: number, h: number, shade: number) =>
  sharp({ create: { width: w, height: h, channels: 3, background: { r: 230, g: 236, b: shade } } })
    .webp()
    .toBuffer();

export async function seedShop(products: SeedProduct[]): Promise<Seeded> {
  const id = uid();
  const category = { id: `e2ec${id}`, name: `e2e-前台${id}` };
  // names carry the run id too: desktop and mobile run every spec in parallel on one database
  products = products.map((p) => ({ ...p, name: `${p.name}${id}` }));
  const keys = { brand: `e2e_b${id}`, model: `e2e_m${id}`, year: `e2e_y${id}` };
  const db = new Client({ connectionString: e2eDatabaseUrl });
  await db.connect();
  await mkdir(E2E_UPLOAD_DIR, { recursive: true });
  const out: Seeded["products"] = [];
  try {
    await db.query("begin");
    await db.query(
      `insert into "Category" (id, name, "sortOrder", "updatedAt") values ($1, $2, 9000, now())`,
      [category.id, category.name],
    );
    const defs: [string, string, string, string[], Record<string, boolean>][] = [
      [keys.brand, "廠牌", "SELECT", BRANDS, { inTitle: true, filterable: true }],
      [keys.model, "型號", "TEXT", [], { inTitle: true }],
      [keys.year, "年份", "YEAR", [], { onCard: true, filterable: true }],
    ];
    for (const [i, [key, label, type, options, flags]] of defs.entries()) {
      await db.query(
        `insert into "AttributeDef" (id, key, label, type, options, "updatedAt")
         values ($1, $1, $2, $3::"AttributeType", $4, now())`,
        [key, label, type, options],
      );
      await db.query(
        `insert into "CategoryAttribute" ("categoryId", "attributeId", "sortOrder", "inTitle", "onCard", "inNameplate", filterable)
         values ($1, $2, $3, $4, $5, true, $6)`,
        [category.id, key, i, !!flags.inTitle, !!flags.onCard, !!flags.filterable],
      );
    }
    for (const [n, p] of products.entries()) {
      const pid = `e2ep${id}${n}`;
      const attrs: Record<string, string | number> = {};
      if (p.brand) attrs[keys.brand] = p.brand;
      if (p.model) attrs[keys.model] = p.model;
      if (p.year) attrs[keys.year] = p.year;
      await db.query(
        `insert into "Product" (id, "categoryId", name, attributes, "priceTwd", highlights, features, "publishedAt", "updatedAt")
         values ($1, $2, $3, $4, $5, $6, '{}', $7, now())`,
        [
          pid,
          category.id,
          p.name,
          JSON.stringify(attrs),
          p.price ?? null,
          p.highlights ?? [],
          p.firstInLatest ? new Date(Date.now() + 30 * 86400_000) : null,
        ],
      );
      for (const [k, [label, value]] of (p.specs ?? []).entries())
        await db.query(
          `insert into "ProductSpec" ("productId", "sortOrder", label, value) values ($1, $2, $3, $4)`,
          [pid, k, label, value],
        );
      for (let k = 0; k < (p.photos ?? 1); k++) {
        const key = `img_${randomBytes(16).toString("hex")}`;
        for (const [size, w, h] of [
          [1600, 1600, 1200],
          [400, 400, 300],
        ] as const)
          await writeFile(join(E2E_UPLOAD_DIR, `${key}-${size}.webp`), await photo(w, h, 40 * k));
        await db.query(
          `insert into "ProductImage" (id, "productId", "sortOrder", "storageKey", width, height)
           values ($1, $2, $3, $4, 1600, 1200)`,
          [`${pid}i${k}`, pid, k, key],
        );
      }
      out.push({ ...p, id: pid, title: [p.brand, p.model].filter(Boolean).join(" ") });
    }
    await db.query("commit");
  } catch (e) {
    await db.query("rollback");
    throw e;
  } finally {
    await db.end();
  }
  return { category, keys, products: out };
}

const STATUS = {
  publish: { button: /^上\s?架$/, shows: "上架中" },
  hide: { button: btn("下架"), shows: "已下架" },
  sell: { button: "標記已售出", shows: "已售出" },
} as const;

// Through the back office, exactly as staff would (the session cookie is added to `context`).
export async function setStatus(
  page: Page,
  context: BrowserContext,
  id: string,
  to: keyof typeof STATUS,
) {
  await signIn(context);
  await page.goto(`/admin/products/${id}`);
  await page.getByRole("button", { name: STATUS[to].button }).click();
  const status = page.getByText("目前狀態").filter({ visible: true }).locator("..");
  await expect(status).toContainText(STATUS[to].shows);
}

export async function publishAll(page: Page, context: BrowserContext, seeded: Seeded) {
  for (const p of seeded.products) await setStatus(page, context, p.id, "publish");
}

export const fullName = (p: { title: string; name: string }) =>
  [p.title, p.name].filter(Boolean).join(" ");

// Fails with the elements that stick out, so a red run says where to look.
export async function noHorizontalScroll(page: Page) {
  const offenders = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth <= width) return [];
    return [...document.querySelectorAll("body *")]
      .filter((el) => el.getBoundingClientRect().right > width + 1)
      .slice(0, 5)
      .map(
        (el) => `${el.tagName.toLowerCase()}.${el.className} → ${el.getBoundingClientRect().right}`,
      );
  });
  expect(offenders).toEqual([]);
}

export async function fillInquiry(page: Page | Locator, name = "e2e 測試") {
  await page.getByLabel("姓名").fill(name);
  await page.getByLabel("聯絡電話").fill("02-1234-5678");
  await page.getByRole("checkbox", { name: /我同意/ }).check();
}

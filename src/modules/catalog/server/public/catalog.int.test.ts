import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, inject, it, vi } from "vitest";

// 'use cache' is a no-op string outside Next; the cache helpers need stubbing.
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));

const { createDb } = await import("@/server/db");
const db = createDb(inject("appDatabaseUrl"), 3, { logQueries: true });
(globalThis as { __asclepiaDb?: unknown }).__asclepiaDb = db; // db() returns this client
let queries = 0;
db.$on("query", () => {
  queries += 1;
});
const { publicFacets, publicProduct, publicProducts } = await import("./catalog");

const tag = randomUUID().slice(0, 8);
const ids: Record<string, string> = {};
let cat = "";
let other = "";

beforeAll(async () => {
  cat = (await db.category.create({ data: { name: `公開-${tag}`, sortOrder: 0 } })).id;
  other = (await db.category.create({ data: { name: `其他公開-${tag}`, sortOrder: 1 } })).id;
  const brand = await db.attributeDef.create({
    data: { key: `pb_${tag}`, label: "品牌", type: "SELECT", options: ["GE", "Philips"] },
  });
  const year = await db.attributeDef.create({
    data: { key: `py_${tag}`, label: "年份", type: "YEAR" },
  });
  const hidden = await db.attributeDef.create({
    data: { key: `ph_${tag}`, label: "隱藏", type: "TEXT" },
  });
  await db.categoryAttribute.createMany({
    data: [
      { categoryId: cat, attributeId: brand.id, sortOrder: 0, inTitle: true, filterable: true },
      { categoryId: cat, attributeId: year.id, sortOrder: 1, onCard: true, filterable: true },
      { categoryId: other, attributeId: hidden.id, sortOrder: 0 },
    ],
  });
  const make = async (k: string, data: Record<string, unknown>) =>
    (ids[k] = (
      await db.product.create({
        data: {
          categoryId: cat,
          name: `商品${k}-${tag}`,
          publishedAt: new Date(),
          sourceName: "內部來源",
          ...data,
        },
      })
    ).id);
  await make("ge2019", {
    status: "PUBLISHED",
    priceTwd: 300,
    attributes: { [`pb_${tag}`]: "GE", [`py_${tag}`]: 2019, [`ph_${tag}`]: "不該出現" },
  });
  await make("ph2012", {
    status: "PUBLISHED",
    priceTwd: 100,
    attributes: { [`pb_${tag}`]: "Philips", [`py_${tag}`]: 2012 },
  });
  await make("ask", {
    status: "PUBLISHED",
    priceTwd: null,
    attributes: { [`pb_${tag}`]: "GE", [`py_${tag}`]: 2021 },
  });
  await make("sold", { status: "SOLD", priceTwd: 50, attributes: { [`pb_${tag}`]: "GE" } });
  await make("draft", { status: "DRAFT", attributes: { [`pb_${tag}`]: "GE" } });
  await make("hidden", { status: "HIDDEN", attributes: { [`pb_${tag}`]: "GE" } });
});
afterAll(() => db.$disconnect());

const names = (r: { items: { name: string }[] }) => r.items.map((i) => i.name.split("-")[0]);

describe("public catalog visibility (S4-4, P6-2)", () => {
  it("lists published and sold items only", async () => {
    const r = await publicProducts({ cat });
    expect(names(r).sort()).toEqual(["商品ask", "商品ge2019", "商品ph2012", "商品sold"].sort());
    expect(r.total).toBe(4);
  });

  it("returns nothing for a draft or hidden product", async () => {
    expect(await publicProduct(ids.draft)).toBeNull();
    expect(await publicProduct(ids.hidden)).toBeNull();
    expect(await publicProduct(ids.sold)).toMatchObject({ sold: true });
  });

  it("exposes only display fields and configured attributes", async () => {
    const p = await publicProduct(ids.ge2019);
    expect(p).not.toBeNull();
    expect(JSON.stringify(p)).not.toContain("內部來源");
    expect(Object.keys(p!)).not.toEqual(
      expect.arrayContaining(["sourceName", "sourceContact", "status"]),
    );
    expect(p!.attrs).toEqual({ [`pb_${tag}`]: "GE", [`py_${tag}`]: 2019 }); // ph_ is not configured here
  });
});

describe("public filters and sorting", () => {
  it("filters by option (OR within a key) and by year-from, ignoring unknown keys", async () => {
    expect(names(await publicProducts({ cat, filters: { [`pb_${tag}`]: ["Philips"] } }))).toEqual([
      "商品ph2012",
    ]);
    const recent = await publicProducts({ cat, filters: { [`py_${tag}`]: ["2015"], nope: ["x"] } });
    expect(names(recent).sort()).toEqual(["商品ask", "商品ge2019"]);
  });

  it("sorts by price with 歡迎詢價 last, and searches attribute text", async () => {
    expect(names(await publicProducts({ cat, sort: "priceAsc" }))).toEqual([
      "商品sold",
      "商品ph2012",
      "商品ge2019",
      "商品ask",
    ]);
    expect(names(await publicProducts({ cat, sort: "priceDesc" }))[3]).toBe("商品ask");
    expect(names(await publicProducts({ cat, q: "Philips" }))).toEqual(["商品ph2012"]);
  });

  it("stays within the read-path query budget when shared reads are cached (≤ 5)", async () => {
    // Shared reads (configs, categories, 新到) are cached across requests; warm them, then count
    // only what one request itself runs. Vitest has no Next cache, so serve them from memory.
    const shared = await import("./shared");
    const warm = {
      configs: await shared.publicConfigs(),
      categories: await shared.publicCategories(),
      newest: await shared.newestIds(),
    };
    const spies = [
      vi.spyOn(shared, "publicConfigs").mockResolvedValue(warm.configs),
      vi.spyOn(shared, "publicCategories").mockResolvedValue(warm.categories),
      vi.spyOn(shared, "newestIds").mockResolvedValue(warm.newest),
    ];
    queries = 0;
    await publicProducts({ cat, q: "商品", filters: { [`pb_${tag}`]: ["GE"] }, sort: "priceAsc" });
    spies.forEach((s) => s.mockRestore());
    expect(queries).toBeGreaterThan(0); // the probe really counts
    expect(queries).toBeLessThanOrEqual(5);
  });
});

describe("public facet counts (list filter panel)", () => {
  it("counts visible items only, per category for the keyword and per option within it", async () => {
    const f = await publicFacets({ cat });
    expect(f).not.toBeNull();
    // drafts and hidden items are not counted (S4-4); sold ones are listed, so they count
    expect(f!.categories[cat]).toBe(4);
    expect(f!.values[`pb_${tag}`]).toEqual({ GE: 3, Philips: 1 });
    const q = await publicFacets({ cat, q: "Philips" });
    expect(q!.categories[cat]).toBe(1);
    expect(q!.values[`pb_${tag}`]).toEqual({ Philips: 1 });
  });

  it("agrees with the list it sits beside", async () => {
    const f = await publicFacets({ cat, q: "商品" });
    const list = await publicProducts({ cat, q: "商品" });
    expect(f!.categories[cat]).toBe(list.total);
    const ge = await publicProducts({ cat, q: "商品", filters: { [`pb_${tag}`]: ["GE"] } });
    expect(f!.values[`pb_${tag}`].GE).toBe(ge.total);
  });
});

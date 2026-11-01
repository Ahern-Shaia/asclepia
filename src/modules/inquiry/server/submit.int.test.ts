import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { createDb } from "@/server/db";
import { DomainError } from "@/server/errors";
import { clientKey, hit } from "@/server/rate-limit";
import { submitInquirySchema } from "../input";
import { submitInquiry } from "./submit";

const db = createDb(inject("appDatabaseUrl"), 3, { logQueries: true });
let queries = 0;
db.$on("query", () => {
  queries += 1;
});
const tag = randomUUID().slice(0, 8);
const ids: Record<string, string> = {};

const input = (productIds: string[]) =>
  submitInquirySchema.parse({
    productIds,
    name: "陳小姐",
    phone: "0912 000 111",
    email: "",
    consent: true,
  });

beforeAll(async () => {
  const cat = await db.category.create({ data: { name: `詢價-${tag}`, sortOrder: 0 } });
  const brand = await db.attributeDef.create({
    data: { key: `ib_${tag}`, label: "品牌", type: "TEXT" },
  });
  await db.categoryAttribute.create({
    data: { categoryId: cat.id, attributeId: brand.id, sortOrder: 0, inTitle: true },
  });
  for (const [k, status, price] of [
    ["a", "PUBLISHED", 380000],
    ["b", "PUBLISHED", null],
    ["sold", "SOLD", 1],
    ["draft", "DRAFT", 1],
  ] as const)
    ids[k] = (
      await db.product.create({
        data: {
          categoryId: cat.id,
          name: `商品${k}`,
          status,
          priceTwd: price,
          attributes: { [`ib_${tag}`]: "GE" },
        },
      })
    ).id;
});
afterAll(() => db.$disconnect());

describe("submitInquiry (inquiry.md §4.2)", () => {
  it("writes the inquiry, item snapshots and an audit row in one statement", async () => {
    queries = 0;
    const r = await submitInquiry(input([ids.a, ids.b]), db);
    expect(queries).toBeLessThanOrEqual(3); // read + write (performance-baseline §0 #3, plus rate limit)
    const saved = await db.inquiry.findUniqueOrThrow({
      where: { id: r.id },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    expect(saved).toMatchObject({ name: "陳小姐", email: null, status: "NEW" });
    expect(saved.purgeAfter.getTime() - saved.createdAt.getTime()).toBeGreaterThan(
      364 * 86_400_000,
    );
    expect(
      saved.items.map((i) => [i.titleSnap, i.priceSnap === null ? null : Number(i.priceSnap)]),
    ).toEqual([
      ["GE 商品a", 380000],
      ["GE 商品b", null],
    ]);
    const audit = await db.auditLog.findFirstOrThrow({ where: { targetId: r.id } });
    expect(audit).toMatchObject({
      actorId: "public",
      action: "inquiry.create",
      diff: { itemCount: 2 },
    });
    expect(JSON.stringify({ ...audit, id: String(audit.id) })).not.toContain("陳小姐"); // no personal data in audit
  });

  it("keeps the price snapshot when the product's price changes later", async () => {
    const r = await submitInquiry(input([ids.a]), db);
    await db.product.update({ where: { id: ids.a }, data: { priceTwd: 1 } });
    const item = await db.inquiryItem.findFirstOrThrow({ where: { inquiryId: r.id } });
    expect(Number(item.priceSnap)).toBe(380000);
    await db.product.update({ where: { id: ids.a }, data: { priceTwd: 380000 } });
  });

  it("writes nothing and names the items when any is sold, hidden or missing", async () => {
    // scoped to this file's product: other test files write inquiries to the same DB in parallel
    const mine = { where: { items: { some: { productId: ids.a } } } };
    const before = await db.inquiry.count(mine);
    try {
      await submitInquiry(input([ids.a, ids.sold, ids.draft, "nope"]), db);
      throw new Error("expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(DomainError);
      expect((e as DomainError).extra.detail).toEqual([ids.sold, ids.draft, "nope"]);
    }
    expect(await db.inquiry.count(mine)).toBe(before);
  });

  it("validates input like the form says", () => {
    const bad = submitInquirySchema.safeParse({
      productIds: [],
      name: "",
      phone: "abc",
      consent: false,
    });
    expect(bad.success).toBe(false);
    expect(
      submitInquirySchema.safeParse({ ...input([ids.a]), productIds: Array(11).fill("x") }).success,
    ).toBe(false);
  });
});

describe("rate limit (stack-rules S4-6)", () => {
  it("allows max per window, then refuses, and never stores the raw address", async () => {
    const key = clientKey(`test-${tag}`, "203.0.113.7");
    expect(key).not.toContain("203.0.113.7");
    const results = [];
    for (let i = 0; i < 6; i++) results.push((await hit(key, 5, 600, db)).allowed);
    expect(results).toEqual([true, true, true, true, true, false]);
    expect((await hit(clientKey(`test-${tag}`, "198.51.100.1"), 5, 600, db)).allowed).toBe(true);
  });
});

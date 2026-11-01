import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, inject } from "vitest";
import { createDb } from "@/server/db";
import { DomainError, toFailure } from "@/server/errors";
import { productInputSchema } from "../product-input";
import { deleteAttributeDef, saveAttributeDef, saveCategoryConfig } from "./attributes";
import { deleteCategory, saveCategory } from "./categories";
import { changeStatus, LIST_MAX, listProducts, saveProduct } from "./products";

// Low-privilege app role, as in production (src/test/global-setup.ts).
const db = createDb(inject("appDatabaseUrl"), 3, { logQueries: true });
let queries = 0;
db.$on("query", () => {
  queries += 1;
});
const ADMIN = "owner@example.com";
const tag = () => randomUUID().slice(0, 8);

async function rejects(p: Promise<unknown>) {
  try {
    await p;
  } catch (e) {
    return { error: e, failure: toFailure(e, "test") };
  }
  throw new Error("expected a rejection");
}

let categoryId = "";
let brandId = "";
let modelId = "";
const brandKey = `brand_${tag()}`;
const modelKey = `model_${tag()}`;
const input = (over: Record<string, unknown> = {}) =>
  productInputSchema.parse({ categoryId, name: "攜帶式超音波", attributes: {}, ...over });

beforeAll(async () => {
  categoryId = (await saveCategory({ name: `超音波-${tag()}` }, ADMIN, db)).id;
  brandId = (
    await saveAttributeDef(
      {
        key: brandKey,
        label: "品牌",
        type: "SELECT",
        options: ["GE", "Philips"],
        unit: null,
        maxLength: null,
      },
      ADMIN,
      db,
    )
  ).id;
  modelId = (
    await saveAttributeDef(
      { key: modelKey, label: "型號", type: "TEXT", options: [], unit: null, maxLength: null },
      ADMIN,
      db,
    )
  ).id;
  const flags = { inTitle: true, onCard: false, inNameplate: true, filterable: false };
  await saveCategoryConfig(
    {
      categoryId,
      rows: [
        { attributeId: brandId, required: true, ...flags, filterable: true },
        { attributeId: modelId, required: true, ...flags },
      ],
    },
    ADMIN,
    db,
  );
});
afterAll(() => db.$disconnect());

describe("product drafts and publishing (catalog.md §4.3)", () => {
  it("saves an incomplete draft but rejects an invalid value", async () => {
    await expect(saveProduct({ input: input({ name: "" }) }, ADMIN, db)).resolves.toMatchObject({
      efficacyWords: [],
    });
    const { failure } = await rejects(
      saveProduct({ input: input({ attributes: { [brandKey]: "Sony" } }) }, ADMIN, db),
    );
    expect(failure).toMatchObject({
      code: "INVALID",
      fieldErrors: { [`attributes.${brandKey}`]: "「品牌」請從選項裡挑一個" },
    });
  });

  it("rejects attribute keys the category doesn't have", async () => {
    const { failure } = await rejects(
      saveProduct({ input: input({ attributes: { colour: "red" } }) }, ADMIN, db),
    );
    expect(failure.code).toBe("INVALID");
  });

  it("lists everything missing before publish, then publishes once complete", async () => {
    const { id } = await saveProduct({ input: input({ name: "" }) }, ADMIN, db);
    const { failure } = await rejects(changeStatus({ id, to: "PUBLISHED" }, ADMIN, db));
    expect(failure.code).toBe("PUBLISH_INCOMPLETE");
    expect(failure.detail).toEqual([
      "品名",
      "請填寫「品牌」",
      "請填寫「型號」",
      "至少一張商品照片",
    ]);

    await saveProduct(
      { id, input: input({ attributes: { [brandKey]: "GE", [modelKey]: "LOGIQ e" } }) },
      ADMIN,
      db,
    );
    await db.productImage.create({
      data: {
        productId: id,
        sortOrder: 0,
        storageKey: `t/${tag()}.webp`,
        width: 1600,
        height: 1200,
      },
    });
    await expect(changeStatus({ id, to: "PUBLISHED" }, ADMIN, db)).resolves.toMatchObject({
      status: "PUBLISHED",
    });
    expect((await db.product.findUniqueOrThrow({ where: { id } })).publishedAt).toBeInstanceOf(
      Date,
    );

    // a public product must stay complete when edited
    const { failure: f2 } = await rejects(
      saveProduct({ id, input: input({ attributes: { [brandKey]: "GE" } }) }, ADMIN, db),
    );
    expect(f2).toMatchObject({
      code: "INVALID",
      fieldErrors: { [`attributes.${modelKey}`]: "請填寫「型號」" },
    });
  });

  it("refuses a status change the workflow doesn't offer", async () => {
    const { id } = await saveProduct({ input: input() }, ADMIN, db);
    const { failure } = await rejects(changeStatus({ id, to: "SOLD" }, ADMIN, db));
    expect(failure.code).toBe("BAD_TRANSITION");
  });
});

describe("switching category (site-config.md §4.1)", () => {
  it("keeps values the new category doesn't use, hidden, and restores them on switching back", async () => {
    const other = (await saveCategory({ name: `其他-${tag()}` }, ADMIN, db)).id;
    const { id } = await saveProduct(
      { input: input({ attributes: { [brandKey]: "GE", [modelKey]: "X1" } }) },
      ADMIN,
      db,
    );
    await saveProduct({ id, input: input({ categoryId: other, attributes: {} }) }, ADMIN, db);
    const stored = (await db.product.findUniqueOrThrow({ where: { id } })).attributes;
    expect(stored).toEqual({ [brandKey]: "GE", [modelKey]: "X1" });
    // the new category still can't receive keys it doesn't define
    const { failure } = await rejects(
      saveProduct(
        { id, input: input({ categoryId: other, attributes: { [brandKey]: "Philips" } }) },
        ADMIN,
        db,
      ),
    );
    expect(failure.code).toBe("INVALID");
  });
});

describe("concurrency and audit", () => {
  it("rejects a save based on a stale version", async () => {
    const first = await saveProduct({ input: input() }, ADMIN, db);
    await saveProduct(
      { id: first.id, expectedUpdatedAt: first.updatedAt, input: input({ name: "A" }) },
      ADMIN,
      db,
    );
    const { failure } = await rejects(
      saveProduct(
        { id: first.id, expectedUpdatedAt: first.updatedAt, input: input({ name: "B" }) },
        ADMIN,
        db,
      ),
    );
    expect(failure.code).toBe("CONFLICT");
  });

  it("warns about efficacy words and records them in audit", async () => {
    const r = await saveProduct({ input: input({ highlights: ["可改善血液循環"] }) }, ADMIN, db);
    expect(r.efficacyWords).toEqual(["改善"]);
    const row = await db.auditLog.findFirstOrThrow({
      where: { targetId: r.id, action: "product.create" },
    });
    expect(row).toMatchObject({
      actorId: ADMIN,
      result: "warn",
      diff: { efficacyWords: ["改善"] },
    });
  });
});

describe("attribute library guards (site-config.md §4.1)", () => {
  it("blocks retyping, removing an option in use, and deleting an attribute in use", async () => {
    await saveProduct(
      { input: input({ name: "在用中", attributes: { [brandKey]: "Philips" } }) },
      ADMIN,
      db,
    );
    const base = { id: brandId, key: brandKey, label: "品牌", unit: null, maxLength: null };
    expect(
      (await rejects(saveAttributeDef({ ...base, type: "TEXT", options: [] }, ADMIN, db))).failure
        .code,
    ).toBe("IN_USE");
    const removing = await rejects(
      saveAttributeDef({ ...base, type: "SELECT", options: ["GE"] }, ADMIN, db),
    );
    expect(removing.failure.code).toBe("IN_USE");
    expect(removing.failure.detail?.[0]).toContain("在用中");
    expect((await rejects(deleteAttributeDef(brandId, ADMIN, db))).failure.code).toBe("IN_USE");
    await expect(
      saveAttributeDef(
        { ...base, type: "SELECT", options: ["GE", "Philips", "Mindray"] },
        ADMIN,
        db,
      ),
    ).resolves.toBeTruthy();
  });

  it("refuses to make a text attribute filterable", async () => {
    const { error } = await rejects(
      saveCategoryConfig(
        {
          categoryId,
          rows: [
            {
              attributeId: modelId,
              required: false,
              inTitle: true,
              onCard: false,
              inNameplate: true,
              filterable: true,
            },
          ],
        },
        ADMIN,
        db,
      ),
    );
    expect(error).toBeInstanceOf(DomainError);
  });

  it("won't delete a category with products, and names a duplicate", async () => {
    expect((await rejects(deleteCategory(categoryId, ADMIN, db))).failure.code).toBe("IN_USE");
    const { failure } = await rejects(
      saveCategory(
        { name: (await db.category.findUniqueOrThrow({ where: { id: categoryId } })).name },
        ADMIN,
        db,
      ),
    );
    expect(failure.code).toBe("DUPLICATE");
  });
});

describe("admin list (performance-baseline §0, stack-rules P2)", () => {
  it("caps a page at LIST_MAX with a cursor and stays within the query budget", async () => {
    const own = (await saveCategory({ name: `批量-${tag()}` }, ADMIN, db)).id;
    await db.product.createMany({
      data: Array.from({ length: LIST_MAX + 2 }, (_, i) => ({
        categoryId: own,
        name: `批量 ${i}`,
      })),
    });
    queries = 0;
    const page = await listProducts({ categoryId: own, q: "批量" }, db);
    expect(queries).toBeLessThanOrEqual(5);
    expect(page.rows).toHaveLength(LIST_MAX);
    expect(page.nextCursor).toBeTruthy();
    const next = await listProducts({ categoryId: own, cursor: page.nextCursor! }, db);
    expect(next.rows).toHaveLength(2);
  });
});

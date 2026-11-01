import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { DB_BUDGET } from "./budget";
import { createDb } from "./db";

// Runs as asclepia_app, the production role (src/test/global-setup.ts).
const db = createDb(inject("appDatabaseUrl"), 3, { logQueries: true });
const owner = new Client({ connectionString: inject("ownerDatabaseUrl") });

let queries = 0;
db.$on("query", () => {
  queries += 1;
});
async function countQueries(fn: () => Promise<unknown>) {
  queries = 0;
  await fn();
  return queries;
}

beforeAll(async () => {
  await owner.connect();
});
afterAll(async () => {
  await db.$disconnect();
  await owner.end();
});

async function seedProduct(suffix: string) {
  const category = await db.category.create({ data: { name: `分類${suffix}`, sortOrder: 0 } });
  return db.product.create({
    data: { categoryId: category.id, name: `商品${suffix}`, attributes: { brand: "GE" } },
  });
}

describe("connection lane (S4-7)", () => {
  it("connects as the low-privilege app role", async () => {
    const [row] = await db.$queryRaw<{ user: string; super: boolean }[]>`
      select current_user as user, rolsuper as super from pg_roles where rolname = current_user`;
    expect(row).toEqual({ user: "asclepia_app", super: false });
  });

  it("cannot run DDL", async () => {
    await expect(db.$executeRaw`create table probe (x int)`).rejects.toThrow();
  });
});

describe("timeouts (P3-1)", () => {
  it("sets statement_timeout from the budget", async () => {
    const [row] = await db.$queryRaw<{ statement_timeout: string }[]>`show statement_timeout`;
    expect(row.statement_timeout).toBe(`${DB_BUDGET.statementMs / 1000}s`);
  });

  it("aborts a statement that runs past the budget", async () => {
    const started = Date.now();
    await expect(
      db.$queryRaw`select pg_sleep(${DB_BUDGET.statementMs / 1000 + 1})`,
    ).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(DB_BUDGET.queryMs + 500);
  });
});

describe("audit log is append-only (R5)", () => {
  it("lets the app insert and read, but not change or delete", async () => {
    const row = await db.auditLog.create({
      data: { actorId: "system", action: "probe", targetType: "test", targetId: "1", result: "ok" },
    });
    expect(await db.auditLog.count()).toBeGreaterThan(0);
    await expect(
      db.auditLog.update({ where: { id: row.id }, data: { result: "warn" } }),
    ).rejects.toThrow();
    await expect(db.auditLog.delete({ where: { id: row.id } })).rejects.toThrow();
  });

  it("blocks the owner too (trigger, not just grants)", async () => {
    await expect(owner.query(`update "AuditLog" set result = 'warn'`)).rejects.toThrow(
      /append-only/,
    );
    await expect(owner.query(`truncate "AuditLog"`)).rejects.toThrow(/append-only/);
  });
});

describe("attribute library (site-config.md §4.1)", () => {
  it("rejects a malformed key and a key change", async () => {
    await expect(
      db.attributeDef.create({ data: { key: "Bad-Key", label: "x", type: "TEXT" } }),
    ).rejects.toThrow();
    const def = await db.attributeDef.create({
      data: { key: "brand", label: "品牌", type: "SELECT" },
    });
    await expect(
      db.attributeDef.update({ where: { id: def.id }, data: { key: "maker" } }),
    ).rejects.toThrow();
    await expect(
      db.attributeDef.update({ where: { id: def.id }, data: { label: "廠牌" } }),
    ).resolves.toMatchObject({ key: "brand", label: "廠牌" });
  });
});

describe("inquiry items (inquiry.md §4.1)", () => {
  it("cascade with the inquiry and keep asked-about products from being deleted", async () => {
    const p = await seedProduct("A");
    const inquiry = await db.inquiry.create({
      data: {
        name: "測試",
        phone: "0912000111",
        consentText: "同意",
        purgeAfter: new Date(Date.now() + 365 * 86_400_000),
        items: {
          create: [{ productId: p.id, sortOrder: 0, titleSnap: "GE 商品A", priceSnap: 1000 }],
        },
      },
    });
    await expect(db.product.delete({ where: { id: p.id } })).rejects.toThrow();
    await db.inquiry.delete({ where: { id: inquiry.id } });
    expect(await db.inquiryItem.count({ where: { inquiryId: inquiry.id } })).toBe(0);
    await expect(db.product.delete({ where: { id: p.id } })).resolves.toBeTruthy();
  });

  it("rejects a negative price snapshot (CHECK)", async () => {
    const p = await seedProduct("B");
    await expect(
      db.inquiry.create({
        data: {
          name: "測試",
          phone: "0912000111",
          consentText: "同意",
          purgeAfter: new Date(Date.now() + 86_400_000),
          items: { create: [{ productId: p.id, sortOrder: 0, titleSnap: "x", priceSnap: -1 }] },
        },
      }),
    ).rejects.toThrow();
  });
});

describe("query counter (P1-1)", () => {
  it("sees every query: an N+1 loop counts N, a batched read counts 1", async () => {
    const ids: string[] = [];
    for (const s of ["C", "D", "E", "F", "G"]) ids.push((await seedProduct(s)).id);
    const looped = await countQueries(async () => {
      for (const id of ids) await db.product.findUnique({ where: { id } });
    });
    const batched = await countQueries(() => db.product.findMany({ where: { id: { in: ids } } }));
    expect(looped).toBeGreaterThanOrEqual(ids.length); // positive control: the probe really fires
    expect(batched).toBe(1);
  });
});

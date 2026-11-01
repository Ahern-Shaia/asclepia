import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, inject, it } from "vitest";
import { createDb } from "@/server/db";
import { pruneRateLimits } from "@/server/rate-limit";
import { submitInquirySchema } from "..";
import { purgeExpiredInquiries } from "./purge";
import { submitInquiry } from "./submit";

// Retention (inquiry.md §7-bis.5) on the low-privilege app role.
const db = createDb(inject("appDatabaseUrl"), 3);
const tag = randomUUID().slice(0, 8);
afterAll(() => db.$disconnect());

describe("purgeExpiredInquiries", () => {
  it("deletes expired inquiries whole, keeps the rest and the products, audits the count only", async () => {
    const cat = await db.category.create({ data: { name: `清除-${tag}`, sortOrder: 0 } });
    const product = await db.product.create({
      data: { categoryId: cat.id, name: `機台-${tag}`, status: "PUBLISHED" },
    });
    const send = (name: string) =>
      submitInquiry(
        submitInquirySchema.parse({
          productIds: [product.id],
          name,
          phone: "02 0000 3333",
          consent: true,
        }),
        db,
      );
    const old = await send("過期的王先生");
    const fresh = await send("還在期限內");
    await db.inquiry.update({
      where: { id: old.id },
      // sent over a year ago (the CHECK keeps purgeAfter after createdAt)
      data: {
        createdAt: new Date(Date.now() - 400 * 24 * 3600 * 1000),
        purgeAfter: new Date(Date.now() - 1000),
      },
    });

    const r = await purgeExpiredInquiries(new Date(), db);
    expect(r.deleted).toBeGreaterThanOrEqual(1);
    expect(await db.inquiry.findUnique({ where: { id: old.id } })).toBeNull();
    expect(await db.inquiryItem.count({ where: { inquiryId: old.id } })).toBe(0);
    expect(await db.inquiry.findUnique({ where: { id: fresh.id } })).not.toBeNull();
    expect(await db.product.findUnique({ where: { id: product.id } })).not.toBeNull();

    const audit = await db.auditLog.findFirstOrThrow({
      where: { action: "inquiry.purge" },
      orderBy: { id: "desc" },
    });
    expect(audit).toMatchObject({ actorId: "system", diff: { count: r.deleted } });
    expect(JSON.stringify({ ...audit, id: String(audit.id) })).not.toContain("王先生");

    // nothing left to delete: still audited, with 0
    expect((await purgeExpiredInquiries(new Date(), db)).deleted).toBe(0);
  });
});

describe("pruneRateLimits", () => {
  it("removes windows that ended before the cut-off and keeps current ones", async () => {
    const day = 24 * 3600 * 1000;
    await db.rateLimitHit.createMany({
      data: [
        { key: `old-${tag}`, windowStart: new Date(Date.now() - 2 * day) },
        { key: `now-${tag}`, windowStart: new Date() },
      ],
    });
    expect(await pruneRateLimits(new Date(Date.now() - day), db)).toBeGreaterThanOrEqual(1);
    const left = await db.rateLimitHit.findMany({ where: { key: { endsWith: tag } } });
    expect(left.map((r) => r.key)).toEqual([`now-${tag}`]);
  });
});

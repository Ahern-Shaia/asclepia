import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, inject, it } from "vitest";
import { createDb } from "@/server/db";
import { DomainError } from "@/server/errors";
import { submitInquirySchema, updateInquirySchema } from "..";
import { deleteInquiry, getInquiry, listInquiries, updateInquiry } from "./admin";
import { submitInquiry } from "./submit";

// Back office (inquiry.md B4) on the low-privilege app role.
const db = createDb(inject("appDatabaseUrl"), 3, { logQueries: true });
let queries = 0;
db.$on("query", () => {
  queries += 1;
});
const tag = randomUUID().slice(0, 8);
const actor = `admin-${tag}@example.com`;
const ids: string[] = [];

const send = (productIds: string[], name = "林先生") =>
  submitInquiry(
    submitInquirySchema.parse({ productIds, name, phone: "02 0000 2222", consent: true }),
    db,
  );

const codeOf = async (p: Promise<unknown>) => {
  try {
    await p;
    return "resolved";
  } catch (e) {
    return e instanceof DomainError ? e.code : "other";
  }
};

beforeAll(async () => {
  const cat = await db.category.create({ data: { name: `後台詢價-${tag}`, sortOrder: 0 } });
  for (const k of ["a", "b", "c"])
    ids.push(
      (
        await db.product.create({
          data: {
            categoryId: cat.id,
            name: `機台${k}-${tag}`,
            status: "PUBLISHED",
            priceTwd: 1000,
          },
        })
      ).id,
    );
});
afterAll(() => db.$disconnect());

describe("listInquiries", () => {
  it("shows the first item, the item count and per-status counts within the query budget", async () => {
    const one = await send([ids[0]]);
    const three = await send([ids[1], ids[0], ids[2]]);
    queries = 0;
    const list = await listInquiries({}, db);
    expect(queries).toBeLessThanOrEqual(4); // performance-baseline §0 #3 (≤ 5 per request)
    const mine = list.rows.filter((r) => r.id === one.id || r.id === three.id);
    expect(mine.map((r) => [r.id, r.items[0].titleSnap, r._count.items])).toEqual([
      [three.id, `機台b-${tag}`, 3], // newest first
      [one.id, `機台a-${tag}`, 1],
    ]);
    expect(list.counts.NEW).toBeGreaterThanOrEqual(2);

    const contacted = await listInquiries({ status: "CONTACTED" }, db);
    expect(contacted.rows.some((r) => r.id === one.id)).toBe(false);
  });
});

describe("updateInquiry", () => {
  it("changes status and note, audits the status change but never the note", async () => {
    const { id } = await send([ids[0]], "王小姐");
    const note = "已回電給王小姐，週二看機";
    const input = updateInquirySchema.parse({
      id,
      status: "CONTACTED",
      note: `  ${note} `,
      expected: { status: "NEW", note: null },
    });
    await updateInquiry(input, actor, db);
    expect(await db.inquiry.findUniqueOrThrow({ where: { id } })).toMatchObject({
      status: "CONTACTED",
      note,
    });
    const audit = await db.auditLog.findFirstOrThrow({
      where: { targetId: id, action: "inquiry.update" },
    });
    expect(audit).toMatchObject({
      actorId: actor,
      result: "ok",
      diff: { status: { from: "NEW", to: "CONTACTED" }, noteChanged: true },
    });
    const text = JSON.stringify({ ...audit, id: String(audit.id) });
    expect(text).not.toContain("王小姐");
    expect(text).not.toContain("週二");
  });

  it("refuses a save based on what someone else already changed (CONFLICT), and a missing row", async () => {
    const { id } = await send([ids[1]]);
    await updateInquiry(
      { id, status: "CONTACTED", note: null, expected: { status: "NEW", note: null } },
      actor,
      db,
    );
    const stale = {
      id,
      status: "CLOSED_LOST" as const,
      note: "x",
      expected: { status: "NEW" as const, note: null },
    };
    expect(await codeOf(updateInquiry(stale, actor, db))).toBe("CONFLICT");
    expect((await db.inquiry.findUniqueOrThrow({ where: { id } })).status).toBe("CONTACTED");
    expect(await codeOf(updateInquiry({ ...stale, id: `missing-${tag}` }, actor, db))).toBe(
      "NOT_FOUND",
    );
  });

  it("writes nothing when nothing changed", async () => {
    const { id } = await send([ids[2]]);
    await updateInquiry(
      { id, status: "NEW", note: null, expected: { status: "NEW", note: null } },
      actor,
      db,
    );
    expect(await db.auditLog.count({ where: { targetId: id, action: "inquiry.update" } })).toBe(0);
  });
});

describe("deleteInquiry", () => {
  it("removes the inquiry and its items, keeps the products, audits id + count only", async () => {
    const { id } = await send([ids[0], ids[1]], "張先生");
    await deleteInquiry(id, actor, db);
    expect(await getInquiry(id, db)).toBeNull();
    expect(await db.inquiryItem.count({ where: { inquiryId: id } })).toBe(0);
    expect(await db.product.count({ where: { id: { in: ids } } })).toBe(3);
    const audit = await db.auditLog.findFirstOrThrow({
      where: { targetId: id, action: "inquiry.delete" },
    });
    expect(audit).toMatchObject({ actorId: actor, diff: { itemCount: 2 } });
    expect(JSON.stringify({ ...audit, id: String(audit.id) })).not.toContain("張先生");
    expect(await codeOf(deleteInquiry(id, actor, db))).toBe("NOT_FOUND");
  });
});

import "server-only";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";

// Retention (inquiry.md §7-bis.5): every inquiry is deleted whole after `purgeAfter` (createdAt +
// 1 year); its items cascade. Bounded batches so one run never holds an unbounded list (R20).
// Audited on every run, even with 0, so the change history shows the job is running.
export const PURGE_BATCH = 500;
const MAX_BATCHES = 20;

export async function purgeExpiredInquiries(now = new Date(), client: Db = db()) {
  let deleted = 0;
  let more = false;
  for (let i = 0; i < MAX_BATCHES; i++) {
    const ids = (
      await client.inquiry.findMany({
        where: { purgeAfter: { lt: now } },
        select: { id: true },
        orderBy: { purgeAfter: "asc" },
        take: PURGE_BATCH,
      })
    ).map((r) => r.id);
    if (ids.length === 0) break;
    deleted += (await client.inquiry.deleteMany({ where: { id: { in: ids } } })).count;
    more = ids.length === PURGE_BATCH && i === MAX_BATCHES - 1;
  }
  await audit(
    {
      actorId: "system",
      action: "inquiry.purge",
      targetType: "inquiry",
      targetId: "*",
      result: "ok",
      diff: { count: deleted, ...(more ? { more: true } : {}) }, // counts only, never contents
    },
    client,
  );
  return { deleted, more };
}

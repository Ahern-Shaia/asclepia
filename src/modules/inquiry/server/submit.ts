import "server-only";
import { randomUUID } from "node:crypto";
import { shopCopy } from "@/copy/shop";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";
import type { SubmitInquiry } from "../input";

const RETENTION_DAYS = 365; // stated on the form (inquiry.md §7-bis.5)

// inquiry.md §4.2: one read, one write. The read checks every product is still PUBLISHED and builds
// the snapshot (title = the category's 組進標題 values + name; price) the buyer saw. The write is a
// single statement inserting the inquiry, its items and the audit row together.
export async function submitInquiry(input: SubmitInquiry, client: Db = db()) {
  const rows = await client.$queryRaw<
    { id: string; status: string; title: string; price: string | null }[]
  >`
    select p."id", p."status"::text as status, p."priceTwd"::text as price,
      btrim(coalesce((
        select string_agg(p."attributes" ->> d."key", ' ' order by ca."sortOrder")
        from "CategoryAttribute" ca join "AttributeDef" d on d."id" = ca."attributeId"
        where ca."categoryId" = p."categoryId" and ca."inTitle" and jsonb_exists(p."attributes", d."key")
      ), '') || ' ' || p."name") as title
    from "Product" p where p."id" = any(${input.productIds})`;

  const byId = new Map(rows.map((r) => [r.id, r]));
  const unavailable = input.productIds.filter((id) => byId.get(id)?.status !== "PUBLISHED");
  // Not "skip the sold one": the buyer would think they asked about it (OQ-INQ-5).
  if (unavailable.length) throw new DomainError("INQUIRY_UNAVAILABLE", { detail: unavailable });

  const id = randomUUID();
  const items = input.productIds.map((pid) => byId.get(pid)!);
  await client.$executeRaw`
    with i as (
      insert into "Inquiry" ("id", "name", "phone", "email", "org", "message", "consentText", "purgeAfter")
      values (${id}, ${input.name}, ${input.phone}, ${input.email}, ${input.org}, ${input.message},
              ${shopCopy.inquiry.consent}, now() + make_interval(days => ${RETENTION_DAYS}))
      returning "id"
    ), items as (
      insert into "InquiryItem" ("inquiryId", "productId", "sortOrder", "titleSnap", "priceSnap")
      select i."id", x.pid, x.ord, x.title, x.price::numeric
      from i, unnest(${items.map((r) => r.id)}::text[], ${items.map((_, k) => k)}::int[],
                     ${items.map((r) => r.title)}::text[], ${items.map((r) => r.price)}::text[])
           as x(pid, ord, title, price)
    )
    insert into "AuditLog" ("actorId", "action", "targetType", "targetId", "result", "diff")
    select 'public', 'inquiry.create', 'inquiry', i."id", 'ok', jsonb_build_object('itemCount', ${items.length}::int)
    from i`;
  return { id, titles: items.map((r) => r.title) };
}

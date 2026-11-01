import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";
import { noNotes, type SiteNotes, siteNotesSchema } from "../../notes";

// The store's own statements (notes.ts). Nothing is shown until the back office sets them.
export async function siteNotes(): Promise<SiteNotes> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return noNotes;
  const row = await db().siteConfig.findUnique({
    where: { section: "COPY" },
    select: { value: true },
  });
  const value = row?.value && typeof row.value === "object" ? row.value : {};
  return siteNotesSchema.parse(value);
}

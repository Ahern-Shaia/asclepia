import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasDatabase } from "@/server/env";
import { siteConfigValues } from "./values";
import { noNotes, type SiteNotes, siteNotesSchema } from "../../notes";

// The store's own statements (notes.ts). Nothing is shown until the back office sets them.
export async function siteNotes(): Promise<SiteNotes> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return noNotes;
  const raw = (await siteConfigValues()).COPY;
  const value = raw && typeof raw === "object" ? raw : {};
  return siteNotesSchema.parse(value);
}

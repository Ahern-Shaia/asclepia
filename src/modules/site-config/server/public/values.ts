import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ConfigSection } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";

// Every SiteConfig section in one query and one cache entry: the public readers (profile, notes,
// theme, home) each take their part, so a page cold after a settings save costs one query, not four
// (performance-baseline §0 #3).
export async function siteConfigValues(): Promise<Partial<Record<ConfigSection, unknown>>> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return {};
  const rows = await db().siteConfig.findMany({ select: { section: true, value: true } });
  return Object.fromEntries(rows.map((r) => [r.section, r.value]));
}

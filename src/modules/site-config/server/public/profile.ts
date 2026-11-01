import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";
import { profileSchema, type SiteProfile } from "../../profile";

export type { SiteProfile };

// Store details for every public page; defaults until the back office saves them (profile.ts).
export async function siteProfile(): Promise<SiteProfile> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return profileSchema.parse({});
  const row = await db().siteConfig.findUnique({
    where: { section: "PROFILE" },
    select: { value: true },
  });
  const value = row?.value && typeof row.value === "object" ? row.value : {};
  return profileSchema.parse({ ...profileSchema.parse({}), ...value });
}

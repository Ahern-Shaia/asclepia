import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { siteCopy } from "@/copy/site";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";

// Store details shown on every public page (site-config.md G1). The back-office editor comes with
// site-config C2; until then — and whenever a key is missing or malformed — defaults apply, so a
// bad row never takes the site down (site-config.md §7-bis 失效).
const profileSchema = z.object({
  name: z.string().min(1).catch(siteCopy.name),
  tagline: z.string().catch(siteCopy.tagline),
  phone: z.string().catch(""),
  email: z.string().catch(""),
  address: z.string().catch(""),
  hours: z.string().catch(""),
});
export type SiteProfile = z.infer<typeof profileSchema>;

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

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasDatabase } from "@/server/env";
import { siteConfigValues } from "./values";
import { profileSchema, type SiteProfile } from "../../profile";

export type { SiteProfile };

// Store details for every public page; defaults until the back office saves them (profile.ts).
export async function siteProfile(): Promise<SiteProfile> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return profileSchema.parse({});
  const raw = (await siteConfigValues()).PROFILE;
  const value = raw && typeof raw === "object" ? raw : {};
  return profileSchema.parse({ ...profileSchema.parse({}), ...value });
}

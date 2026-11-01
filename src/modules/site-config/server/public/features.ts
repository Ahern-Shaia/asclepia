import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { ALL_ON, readFeatures, type SiteFeatures } from "../../features";
import { siteConfigValues } from "./values";
import { hasDatabase } from "@/server/env";

// Feature switches for the public site (features.ts). All on until the back office saves them.
export async function siteFeatures(): Promise<SiteFeatures> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return ALL_ON;
  return readFeatures((await siteConfigValues()).values.FEATURES);
}

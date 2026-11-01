import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasDatabase } from "@/server/env";
import { DEFAULT_TEXTS, readTexts, type SiteTexts } from "../../texts";
import { siteConfigValues } from "./values";

// Hero heading, 怎麼買 steps and footer line (texts.ts); the code defaults until edited.
export async function siteTexts(): Promise<SiteTexts> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return DEFAULT_TEXTS;
  return readTexts((await siteConfigValues()).values.COPY);
}

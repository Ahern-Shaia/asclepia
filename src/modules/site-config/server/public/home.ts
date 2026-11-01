import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasDatabase } from "@/server/env";
import { siteConfigValues } from "./values";
import { DEFAULT_HOME, type HomeLayout, readHome } from "../../home";

// Order and visibility of the home page blocks (home.ts). All on, default order, until saved.
export async function siteHome(): Promise<HomeLayout> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return DEFAULT_HOME;
  const raw = (await siteConfigValues()).values.HOME;
  return readHome(raw);
}

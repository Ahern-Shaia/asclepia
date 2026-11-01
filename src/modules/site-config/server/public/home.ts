import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";
import { DEFAULT_HOME, type HomeLayout, readHome } from "../../home";

// Order and visibility of the home page blocks (home.ts). All on, default order, until saved.
export async function siteHome(): Promise<HomeLayout> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return DEFAULT_HOME;
  const row = await db().siteConfig.findUnique({
    where: { section: "HOME" },
    select: { value: true },
  });
  return readHome(row?.value);
}

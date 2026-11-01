import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";
import { DEFAULT_THEME, type ThemeInput } from "@/theme/derive";
import { readTheme } from "../../theme";

// The public site's two colours and radius (theme.ts). Default until the back office saves one.
export async function siteTheme(): Promise<ThemeInput> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return DEFAULT_THEME;
  const row = await db().siteConfig.findUnique({
    where: { section: "THEME" },
    select: { value: true },
  });
  return readTheme(row?.value);
}

import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasDatabase } from "@/server/env";
import { siteConfigValues } from "./values";
import { DEFAULT_THEME, type ThemeInput } from "@/theme/derive";
import { readTheme } from "../../theme";

// The public site's two colours and radius (theme.ts). Default until the back office saves one.
export async function siteTheme(): Promise<ThemeInput> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return DEFAULT_THEME;
  const raw = (await siteConfigValues()).THEME;
  return readTheme(raw);
}

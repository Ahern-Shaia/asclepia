import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ConfigSection } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";
import { fileName, KEY } from "@/server/images/storage";
import { SITE_IMAGE_SIZE, type SiteImageKind, type SiteImages } from "../../images";

type Row = { t: "C" | "A"; k: string; value: unknown };
export type SiteConfigValues = {
  values: Partial<Record<ConfigSection, unknown>>;
  images: SiteImages;
};

// Every SiteConfig section and the store images in one query and one cache entry: the public
// readers (profile, notes, theme, home, images) each take their part, so a page cold after a
// settings save costs one query, not five (performance-baseline §0 #3).
export async function siteConfigValues(): Promise<SiteConfigValues> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return { values: {}, images: {} };
  const rows = await db().$queryRaw<Row[]>`
    select 'C' as t, "section"::text as k, "value" from "SiteConfig"
    union all
    select 'A', "kind"::text,
      jsonb_build_object('key', "storageKey", 'width', "width", 'height', "height")
    from "SiteAsset" where "kind" in ('LOGO', 'HERO')`;
  const out: SiteConfigValues = { values: {}, images: {} };
  for (const r of rows) {
    if (r.t === "C") out.values[r.k as ConfigSection] = r.value;
    else {
      const a = r.value as { key: string; width: number; height: number };
      const kind = r.k as SiteImageKind;
      if (KEY.test(a.key) && kind in SITE_IMAGE_SIZE)
        out.images[kind] = {
          src: `/media/${fileName(a.key, SITE_IMAGE_SIZE[kind])}`,
          width: a.width,
          height: a.height,
        };
    }
  }
  return out;
}

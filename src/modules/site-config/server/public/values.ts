import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { ConfigSection } from "@/generated/prisma/client";
import { db } from "@/server/db";
import { hasDatabase } from "@/server/env";
import { KEY } from "@/server/images/storage";
import { SITE_IMAGE_KINDS, type SiteImageKind, type SiteImages } from "../../images";
import { srcOf } from "../media";

type Row = { t: "C" | "A"; k: string; value: unknown };
type Asset = { key: string; width: number; height: number; alt: string | null; sort: number };
export type SiteConfigValues = {
  values: Partial<Record<ConfigSection, unknown>>;
  images: SiteImages;
};

// Every SiteConfig section and the store images in one query and one cache entry: the public
// readers (profile, notes, theme, home, images…) each take their part, so a page cold after a
// settings save costs one query, not one per section (performance-baseline §0 #3).
export async function siteConfigValues(): Promise<SiteConfigValues> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  if (!hasDatabase()) return { values: {}, images: {} };
  const rows = await db().$queryRaw<Row[]>`
    select 'C' as t, "section"::text as k, "value" from "SiteConfig"
    union all
    select 'A', "kind"::text,
      jsonb_build_object('key', "storageKey", 'width', "width", 'height', "height", 'alt', "alt", 'sort', "sortOrder")
    from (
      select * from "SiteAsset"
      where "kind" in ('LOGO', 'HERO', 'VISIT', 'FAVICON', 'BRAND_LOGO')
      limit 200
    ) a`;
  const out: SiteConfigValues = { values: {}, images: { brands: [] } };
  const brands: (Asset & { src: string })[] = [];
  for (const r of rows) {
    if (r.t === "C") {
      out.values[r.k as ConfigSection] = r.value;
      continue;
    }
    const a = r.value as Asset;
    if (!KEY.test(a.key)) continue;
    if (r.k === "BRAND_LOGO") {
      if (a.alt) brands.push({ ...a, src: srcOf(r.k, a.key) });
    } else if ((SITE_IMAGE_KINDS as readonly string[]).includes(r.k))
      out.images[r.k as SiteImageKind] = {
        src: srcOf(r.k, a.key),
        width: a.width,
        height: a.height,
      };
  }
  // UNION ALL keeps no order: brand logos are sorted here
  out.images.brands = brands
    .sort((x, y) => x.sort - y.sort)
    .map((b) => ({ brand: b.alt!, src: b.src }));
  return out;
}

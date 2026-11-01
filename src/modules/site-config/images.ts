import { z } from "zod";

// Store images set in the back office (site-config.md §4.2 SiteAsset), one per kind: the header
// logo, the home hero photo, the 看機地點 photo and the browser tab icon. Brand logos are many,
// one per brand name (stored in SiteAsset.alt, which is also their accessible name).
// Same pipeline as product photos (src/server/images).
export const SITE_IMAGE_KINDS = ["LOGO", "HERO", "VISIT", "FAVICON"] as const;
export type SiteImageKind = (typeof SITE_IMAGE_KINDS)[number];
export const siteImageKindSchema = z.enum(SITE_IMAGE_KINDS);
export type SiteImage = { src: string; width: number; height: number };
export type BrandLogo = { brand: string; src: string };
export type SiteImages = Partial<Record<SiteImageKind, SiteImage>> & { brands?: BrandLogo[] };

// The favicon is a square PNG set (512 / 180 / 32); its `src` is the 512 master.
export const iconSrc = (src512: string, size: 180 | 32) =>
  src512.replace(/-512\.png$/, `-${size}.png`);

export const BRAND_MAX = 60;
export const brandNameSchema = z.string().trim().min(1).max(BRAND_MAX);

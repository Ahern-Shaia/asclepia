import { z } from "zod";

// Store images set in the back office (site-config.md §4.2 SiteAsset): one logo for the header and
// footer, one photo for the home hero. Same pipeline as product photos (src/server/images).
export const SITE_IMAGE_KINDS = ["LOGO", "HERO"] as const;
export type SiteImageKind = (typeof SITE_IMAGE_KINDS)[number];
export const siteImageKindSchema = z.enum(SITE_IMAGE_KINDS);
export type SiteImage = { src: string; width: number; height: number };
export type SiteImages = Partial<Record<SiteImageKind, SiteImage>>;

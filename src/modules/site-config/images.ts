import { z } from "zod";

// Store images set in the back office (site-config.md §4.2 SiteAsset): one logo for the header and
// footer, one photo for the home hero. Same pipeline as product photos (src/server/images).
export const SITE_IMAGE_KINDS = ["LOGO", "HERO"] as const;
export type SiteImageKind = (typeof SITE_IMAGE_KINDS)[number];
export const siteImageKindSchema = z.enum(SITE_IMAGE_KINDS);
export type SiteImage = { src: string; width: number; height: number };
export type SiteImages = Partial<Record<SiteImageKind, SiteImage>>;
// The logo is shown 40 px tall: the 400 px rendition is plenty; the hero needs the 1600 one.
export const SITE_IMAGE_SIZE: Record<SiteImageKind, 400 | 1600> = { LOGO: 400, HERO: 1600 };

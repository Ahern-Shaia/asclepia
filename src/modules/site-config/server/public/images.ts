import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { SiteImages } from "../../images";
import { siteConfigValues } from "./values";

// The store logo and hero photo, when the back office has set them (images.ts).
export async function siteImages(): Promise<SiteImages> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-config");
  return (await siteConfigValues()).images;
}

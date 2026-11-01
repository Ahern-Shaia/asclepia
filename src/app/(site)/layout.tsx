import type { Metadata } from "next";
import { siteCopy } from "@/copy/site";
import { iconSrc } from "@/modules/site-config/images";
import { siteImages } from "@/modules/site-config/server/public/images";
import { siteProfile } from "@/modules/site-config/server/public/profile";

// Store-wide metadata for the public site (back office: 店家資料, 圖片): the default title, the
// search-result description and the browser tab icon. Pages set their own titles on top.
export async function generateMetadata(): Promise<Metadata> {
  const [profile, images] = await Promise.all([siteProfile(), siteImages()]);
  const icon = images.FAVICON?.src;
  return {
    title: profile.tagline ? `${profile.name}｜${profile.tagline}` : profile.name,
    description: profile.seo || siteCopy.description,
    ...(icon
      ? {
          icons: {
            icon: [
              { url: iconSrc(icon, 32), sizes: "32x32", type: "image/png" },
              { url: icon, sizes: "512x512", type: "image/png" },
            ],
            apple: { url: iconSrc(icon, 180), sizes: "180x180" },
          },
        }
      : {}),
  };
}

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return children;
}

import type { ReactNode } from "react";
import { ShopShell } from "@/components/shop/shop-shell";
import { publicCategories } from "@/modules/catalog/server/public/catalog";
import type { SiteFeatures } from "@/modules/site-config/features";
import { siteFeatures } from "@/modules/site-config/server/public/features";
import { siteImages } from "@/modules/site-config/server/public/images";
import { siteProfile } from "@/modules/site-config/server/public/profile";
import { siteTexts } from "@/modules/site-config/server/public/texts";
import { siteTheme } from "@/modules/site-config/server/public/theme";
import { deriveTheme } from "@/theme/derive";

// Store details + categories for the header and footer. Both reads are cached and shared by every
// public page, so they land in the prerendered shell.
export async function storeInfo() {
  const [profile, categories, theme, images, features, texts] = await Promise.all([
    siteProfile(),
    publicCategories(),
    siteTheme(),
    siteImages(),
    siteFeatures(),
    siteTexts(),
  ]);
  return {
    profile,
    company: {
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      hours: profile.hours,
      map: profile.map,
    },
    brand: { name: profile.name, tagline: profile.tagline },
    categories,
    theme: deriveTheme(theme),
    images,
    features,
    texts,
  };
}

export async function StoreFrame({ children }: { children: ReactNode }) {
  const { company, brand, categories, theme, images, features, texts } = await storeInfo();
  return (
    <ShopShell
      base=""
      company={company}
      brand={brand}
      categories={categories}
      theme={theme}
      logo={images.LOGO}
      features={features}
      footerLine={texts.footerLine}
    >
      {children}
    </ShopShell>
  );
}

export const pageTitle = (title: string, store: string) => `${title}｜${store}`;

// Prices switched off in the back office (site-config.md §4.6) never leave the server: hiding them
// only in the components would still ship them in the page data.
export const priced = <T extends { priceTwd?: number | null }>(items: T[], f: SiteFeatures): T[] =>
  f.showPrice ? items : items.map((p) => ({ ...p, priceTwd: undefined }));

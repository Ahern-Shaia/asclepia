import type { ReactNode } from "react";
import { ShopShell } from "@/components/shop/shop-shell";
import { publicCategories } from "@/modules/catalog/server/public/catalog";
import { siteImages } from "@/modules/site-config/server/public/images";
import { siteProfile } from "@/modules/site-config/server/public/profile";
import { siteTheme } from "@/modules/site-config/server/public/theme";
import { deriveTheme } from "@/theme/derive";

// Store details + categories for the header and footer. Both reads are cached and shared by every
// public page, so they land in the prerendered shell.
export async function storeInfo() {
  const [profile, categories, theme, images] = await Promise.all([
    siteProfile(),
    publicCategories(),
    siteTheme(),
    siteImages(),
  ]);
  return {
    profile,
    company: {
      name: profile.name,
      phone: profile.phone,
      email: profile.email,
      address: profile.address,
      hours: profile.hours,
    },
    brand: { name: profile.name, tagline: profile.tagline },
    categories,
    theme: deriveTheme(theme),
    images,
  };
}

export async function StoreFrame({ children }: { children: ReactNode }) {
  const { company, brand, categories, theme, images } = await storeInfo();
  return (
    <ShopShell
      base=""
      company={company}
      brand={brand}
      categories={categories}
      theme={theme}
      logo={images.LOGO}
    >
      {children}
    </ShopShell>
  );
}

export const pageTitle = (title: string, store: string) => `${title}｜${store}`;

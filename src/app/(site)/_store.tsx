import type { ReactNode } from "react";
import { ShopShell } from "@/components/shop/shop-shell";
import { publicCategories } from "@/modules/catalog/server/public/catalog";
import { siteProfile } from "@/modules/site-config/server/public/profile";

// Store details + categories for the header and footer. Both reads are cached and shared by every
// public page, so they land in the prerendered shell.
export async function storeInfo() {
  const [profile, categories] = await Promise.all([siteProfile(), publicCategories()]);
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
  };
}

export async function StoreFrame({ children }: { children: ReactNode }) {
  const { company, brand, categories } = await storeInfo();
  return (
    <ShopShell base="" company={company} brand={brand} categories={categories}>
      {children}
    </ShopShell>
  );
}

export const pageTitle = (title: string, store: string) => `${title}｜${store}`;

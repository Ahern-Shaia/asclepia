// STYLE LAB — shared content for the 20 "實機型錄" variants (10 corporate c01–c10, 10 rigorous r01–r10).
// Same structure and copy as /mockup/site-v4; only the visual style changes.
import type { EquipKind } from "@/components/home-v4/equip-illus";
import { homeV3Copy } from "@/copy/home-v3";
import { homeV4Copy } from "@/copy/home-v4";
import { brands, categories, company, publicProducts } from "../_data";
import { categoryName } from "../_adapters";

export const SITE = "/mockup/site";

const newest = [...publicProducts]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 2)
  .map((p) => p.id);

export const v = {
  copy: homeV3Copy,
  hero: homeV4Copy,
  brand: { name: "Asclepia", tagline: "中古設備買賣" },
  company,
  brands,
  categories: categories.map((c) => ({
    id: c.id as EquipKind,
    name: c.name,
    count: c.count,
    href: `${SITE}/products?cat=${c.id}`,
  })),
  total: categories.reduce((n, c) => n + c.count, 0),
  latest: publicProducts.slice(0, 4).map((p) => ({
    id: p.id,
    href: `${SITE}/products/${p.id}`,
    kind: p.categoryId as EquipKind,
    categoryName: categoryName(p.categoryId),
    brand: p.brand,
    model: p.model,
    nameZh: p.nameZh,
    year: p.year,
    condition: p.condition?.split("，")[0],
    warranty: p.warranty,
    priceTwd: p.priceTwd,
    sold: p.status === "SOLD",
    isNew: newest.includes(p.id),
  })),
  copyright: "© Asclepia",
} as const;

export const twd = (n: number) => `NT$ ${n.toLocaleString("zh-TW")}`;

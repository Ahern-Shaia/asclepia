import type { EquipKind } from "@/components/home-v4/equip-illus";
import { HomeV4View } from "@/components/home-v4/home-v4-view";
import { brands, categories, company, publicProducts } from "../_data";
import { categoryName, SITE } from "../_adapters";

// "新到" is derived (two most recently updated public items), not a stored status.
const newest = [...publicProducts]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 2)
  .map((p) => p.id);

export default function Page() {
  return (
    <HomeV4View
      base={SITE}
      company={company}
      brands={brands}
      categories={categories.map((c) => ({ ...c, id: c.id as EquipKind }))}
      latest={publicProducts.slice(0, 4).map((p) => ({
        id: p.id,
        categoryName: categoryName(p.categoryId),
        brand: p.brand,
        model: p.model,
        nameZh: p.nameZh,
        year: p.year,
        condition: p.condition,
        warranty: p.warranty,
        priceTwd: p.priceTwd,
        sold: p.status === "SOLD",
        isNew: newest.includes(p.id),
        kind: p.categoryId as EquipKind,
      }))}
    />
  );
}

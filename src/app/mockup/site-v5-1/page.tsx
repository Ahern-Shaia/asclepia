import type { EquipKind } from "@/components/home-v4/equip-illus";
import { HomeV51View } from "@/components/home-v5-1/home-v5-1-view";
import { categoryAttributes, SHOP, shopProducts } from "../_attrs";
import { brands, categories, company, sampleNotes } from "../_data";

export default function Page() {
  return (
    <HomeV51View
      base={SHOP}
      company={company}
      notes={sampleNotes}
      brands={brands}
      categories={categories.map((c) => ({ ...c, icon: c.id as EquipKind }))}
      latest={shopProducts.slice(0, 4)}
      configs={categoryAttributes}
      mock
    />
  );
}

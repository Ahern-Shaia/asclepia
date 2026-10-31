import { HomeV3View } from "@/components/home-v3/home-v3-view";
import { brands, categories, company, publicProducts } from "../_data";
import { categoryName, SITE } from "../_adapters";

// "新到" is derived (two most recently updated public items), not a stored status.
const newest = [...publicProducts]
  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  .slice(0, 2)
  .map((p) => p.id);

export default function Page() {
  return (
    <HomeV3View
      base={SITE}
      company={company}
      brands={brands}
      categories={categories.map((c) => ({ ...c, image: `/mockup/${c.id}-1.svg` }))}
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
        image: p.images[0],
      }))}
    />
  );
}

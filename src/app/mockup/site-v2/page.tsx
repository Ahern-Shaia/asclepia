import { HomeV2View } from "@/components/home-v2/home-v2-view";
import { categories, company, publicProducts } from "../_data";
import { SITE, toCard } from "../_adapters";

export default function Page() {
  return (
    <HomeV2View
      base={SITE}
      company={company}
      categories={categories.map((c) => ({ ...c, image: `/mockup/${c.id}-1.svg` }))}
      latest={publicProducts.slice(0, 4).map((p) => ({ ...toCard(p), warranty: p.warranty }))}
    />
  );
}

import { HomeView } from "@/components/catalog/home-view";
import { categories, publicProducts } from "../_data";
import { SITE, toCard } from "../_adapters";

export default function Page() {
  return (
    <HomeView
      base={SITE}
      categories={categories.map((c) => ({ ...c, image: `/mockup/${c.id}-1.svg` }))}
      latest={publicProducts.slice(0, 8).map(toCard)}
    />
  );
}

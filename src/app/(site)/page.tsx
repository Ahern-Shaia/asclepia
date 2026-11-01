import { isEquipKind } from "@/components/home-v4/equip-illus";
import { HomeV51View } from "@/components/home-v5-1/home-v5-1-view";
import {
  publicBrands,
  publicConfigs,
  publicProducts,
} from "@/modules/catalog/server/public/catalog";
import { siteNotes } from "@/modules/site-config/server/public/notes";
import { storeInfo } from "./_store";

const LATEST = 4;

// Home (§B0 inspect-catalog, baseline /mockup/site-v5-1). Every read is cached, so the whole page
// is prerendered and re-rendered when an admin write calls updateTag('catalog').
export default async function Home() {
  const [store, latest, brands, configs, notes] = await Promise.all([
    storeInfo(),
    publicProducts({ sort: "new" }),
    publicBrands(),
    publicConfigs(),
    siteNotes(),
  ]);
  return (
    <HomeV51View
      base=""
      company={store.company}
      notes={notes}
      brand={store.brand}
      categories={store.categories.map((c) => ({
        id: c.id,
        name: c.name,
        count: c.count,
        icon: isEquipKind(c.iconKey) ? c.iconKey : null,
      }))}
      brands={brands}
      latest={latest.items.slice(0, LATEST)}
      configs={configs}
    />
  );
}

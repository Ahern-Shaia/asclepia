import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopListView } from "@/components/shop/list-view";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { shopCopy } from "@/copy/shop";
import {
  publicCategories,
  publicConfigs,
  publicFacets,
  publicProducts,
} from "@/modules/catalog/server/public/catalog";
import { siteProfile } from "@/modules/site-config/server/public/profile";
import { listQuery } from "../../_params";
import { pageTitle } from "../../_store";

const c = shopCopy.list;

export async function generateMetadata({
  searchParams,
}: PageProps<"/products">): Promise<Metadata> {
  const query = listQuery(await searchParams);
  const [profile, categories] = await Promise.all([siteProfile(), publicCategories()]);
  const heading = query.q
    ? c.keyword(query.q)
    : (categories.find((x) => x.id === query.cat)?.name ?? c.title);
  return { title: pageTitle(heading, profile.name), description: c.metaDescription };
}

// Filtering, sorting and paging happen in the catalog read (URL → publicProducts); the shell
// around this page is prerendered and the results stream in.
export default function Page({ searchParams }: PageProps<"/products">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}

async function Results({ searchParams }: Pick<PageProps<"/products">, "searchParams">) {
  const query = listQuery(await searchParams);
  const [result, facets, categories, configs, profile] = await Promise.all([
    publicProducts(query),
    publicFacets({ cat: query.cat, q: query.q }),
    publicCategories(),
    publicConfigs(),
    siteProfile(),
  ]);
  return (
    <ShopListView
      base=""
      phone={profile.phone}
      categories={categories}
      products={result.items}
      total={result.total}
      facets={facets ?? { all: null, categories: null, values: null }}
      nextCursor={result.nextCursor}
      configs={configs}
    />
  );
}

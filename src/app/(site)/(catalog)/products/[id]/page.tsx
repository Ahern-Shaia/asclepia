import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { titleOf } from "@/components/shop/attrs";
import { ShopDetailView } from "@/components/shop/detail-view";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { shopCopy } from "@/copy/shop";
import {
  publicConfigs,
  publicProduct,
  publicProducts,
} from "@/modules/catalog/server/public/catalog";
import { submitInquiryAction } from "@/modules/inquiry/actions";
import { siteNotes } from "@/modules/site-config/server/public/notes";
import { siteProfile } from "@/modules/site-config/server/public/profile";
import { productId } from "../../../_params";
import { pageTitle } from "../../../_store";

const RELATED = 4;

// Drafts and hidden items are not in the public read (S4-4), so they land on not-found like any
// unknown id. After an admin hides an item, updateTag makes the next request miss (P7-3).
async function find(params: PageProps<"/products/[id]">["params"]) {
  const id = productId.safeParse((await params).id);
  return id.success ? publicProduct(id.data) : null;
}

export async function generateMetadata({ params }: PageProps<"/products/[id]">): Promise<Metadata> {
  const [p, profile] = await Promise.all([find(params), siteProfile()]);
  if (!p) return { title: pageTitle(shopCopy.detail.notFoundTitle, profile.name) };
  const name = [titleOf(p.config, p.attrs), p.name].filter(Boolean).join(" ");
  const description = p.highlights.slice(0, 2).join("；").slice(0, 160);
  return { title: pageTitle(name, profile.name), ...(description ? { description } : {}) };
}

export default function Page({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: Pick<PageProps<"/products/[id]">, "params">) {
  const p = await find(params);
  if (!p) notFound();
  const [profile, configs, sameCategory, notes] = await Promise.all([
    siteProfile(),
    publicConfigs(),
    publicProducts({ cat: p.categoryId }),
    siteNotes(),
  ]);
  const { config, ...product } = p;
  return (
    <ShopDetailView
      base=""
      phone={profile.phone}
      product={product}
      config={config}
      related={sameCategory.items.filter((x) => x.id !== p.id).slice(0, RELATED)}
      configs={configs}
      terms={notes.terms}
      send={submitInquiryAction}
    />
  );
}

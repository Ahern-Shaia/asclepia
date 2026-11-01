import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LiveInquiryView } from "@/components/shop/inquiry-live";
import { shopCopy } from "@/copy/shop";
import { submitInquiryAction } from "@/modules/inquiry/actions";
import { siteFeatures } from "@/modules/site-config/server/public/features";
import { siteProfile } from "@/modules/site-config/server/public/profile";
import { pageTitle } from "../../_store";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await siteProfile();
  return { title: pageTitle(shopCopy.inquiry.metaTitle, profile.name), robots: { index: false } };
}

// The list itself lives in the visitor's browser (inquiry.md OQ-INQ-1); the page is a static
// shell that looks the items up after it loads.
export default async function Page() {
  const [profile, features] = await Promise.all([siteProfile(), siteFeatures()]);
  if (!features.inquiryList) notFound(); // switched off in the back office (site-config.md §4.6)
  return <LiveInquiryView phone={profile.phone} send={submitInquiryAction} />;
}

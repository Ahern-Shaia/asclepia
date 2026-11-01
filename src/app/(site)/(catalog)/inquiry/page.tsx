import type { Metadata } from "next";
import { LiveInquiryView } from "@/components/shop/inquiry-live";
import { shopCopy } from "@/copy/shop";
import { submitInquiryAction } from "@/modules/inquiry/actions";
import { siteProfile } from "@/modules/site-config/server/public/profile";
import { pageTitle } from "../../_store";

export async function generateMetadata(): Promise<Metadata> {
  const profile = await siteProfile();
  return { title: pageTitle(shopCopy.inquiry.metaTitle, profile.name), robots: { index: false } };
}

// The list itself lives in the visitor's browser (inquiry.md OQ-INQ-1); the page is a static
// shell that looks the items up after it loads.
export default async function Page() {
  const profile = await siteProfile();
  return <LiveInquiryView phone={profile.phone} send={submitInquiryAction} />;
}

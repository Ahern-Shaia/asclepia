import type React from "react";
import { MockBanner } from "@/components/catalog/mock-banner";

// Every style-lab page is a mockup with sample data; the banner says so on every page,
// including when the lab is opened on a shared deployment (ENABLE_MOCKUPS=1).
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MockBanner />
      {children}
    </>
  );
}

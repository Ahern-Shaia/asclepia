import type React from "react";
import { CatalogFrame } from "@/components/catalog/catalog-frame";
import { company } from "../_data";
import { SITE } from "../_adapters";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CatalogFrame base={SITE} company={company} mock>
      {children}
    </CatalogFrame>
  );
}

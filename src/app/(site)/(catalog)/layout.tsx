import { StoreFrame } from "../_store";

// Inner pages (list, product, inquiry list) share the header with search; the home page renders
// its own header without it (§B0: one search per page).
export default function CatalogLayout({ children }: LayoutProps<"/">) {
  return <StoreFrame>{children}</StoreFrame>;
}

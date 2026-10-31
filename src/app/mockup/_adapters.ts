import type { CardProduct } from "@/components/catalog/product-card";
import { categories, type MockProduct } from "./_data";

export const SITE = "/mockup/site";
export const ADMIN = "/mockup/admin";

export const toCard = (p: MockProduct): CardProduct & { categoryId: string } => ({
  id: p.id,
  brand: p.brand,
  model: p.model,
  nameZh: p.nameZh,
  licenseNo: p.licenseNo,
  priceTwd: p.priceTwd,
  sold: p.status === "SOLD",
  image: p.images[0],
  categoryId: p.categoryId,
});

export const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

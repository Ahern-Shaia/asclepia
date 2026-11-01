// Shapes of the public catalog DTOs (stack-rules P6-2: fixed shapes, nothing internal).
export const VISIBLE = ["PUBLISHED", "SOLD"] as const;
export const PUBLIC_PAGE = 48;

export type PublicAttr = {
  key: string;
  label: string;
  type: "TEXT" | "NUMBER" | "YEAR" | "SELECT";
  options: string[];
  unit?: string;
  required: boolean;
  inTitle: boolean;
  onCard: boolean;
  inNameplate: boolean;
  filterable: boolean;
};
export type PublicCard = {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  attrs: Record<string, string | number>;
  priceTwd?: number;
  sold: boolean;
  isNew: boolean;
  image: string | null; // storage key; /media/<key>-400.webp
};

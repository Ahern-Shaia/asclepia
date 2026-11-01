// Plain-data adapters between the catalog DAL (server pages) and the back-office client views.
// No "use client": server pages call these before handing props over.
import type { CategoryAttr } from "@/components/shop/attrs";

export type ProductStatus = "DRAFT" | "PUBLISHED" | "HIDDEN" | "SOLD";
export const PRODUCT_STATUSES: readonly ProductStatus[] = ["DRAFT", "PUBLISHED", "HIDDEN", "SOLD"];

// A category's attribute config as the product form needs it (adds the TEXT length limit).
export type FormAttr = CategoryAttr & { attributeId: string; maxLength: number | null };

type ConfigRow = Omit<FormAttr, "unit"> & { unit: string | null };

export const toFormConfigs = (configs: Record<string, ConfigRow[]>) =>
  Object.fromEntries(
    Object.entries(configs).map(([id, rows]) => [
      id,
      rows.map((r): FormAttr => ({ ...r, unit: r.unit ?? undefined })),
    ]),
  );

export type AttrValues = Record<string, string | number>;

// Product.attributes is JSON; keep only the scalar values the form and title understand.
export function attrValues(json: unknown): AttrValues {
  if (!json || typeof json !== "object" || Array.isArray(json)) return {};
  return Object.fromEntries(
    Object.entries(json).filter(([, v]) => typeof v === "string" || typeof v === "number"),
  ) as AttrValues;
}

// Decimal(12, 0) fits in a double exactly (≤ 999,999,999,999 < 2^53).
export const priceOf = (d: { toString(): string } | null) => (d === null ? null : Number(d));

const time = new Intl.DateTimeFormat("zh-TW", {
  timeZone: "Asia/Taipei",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
// Formatted on the server only, so the browser's time zone can't cause a hydration mismatch.
// "2026/11/01 14:03", assembled by hand: the date/time separator differs between ICU builds.
export function formatTime(d: Date) {
  const p = Object.fromEntries(time.formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}`;
}

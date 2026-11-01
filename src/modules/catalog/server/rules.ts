import "server-only";
import type { AttrRule } from "../attribute-schema";
import type { Client } from "./tx";

// The category's attribute config, in display order (site-config.md §4.1).
export async function loadRules(client: Client, categoryId: string): Promise<AttrRule[]> {
  const rows = await client.categoryAttribute.findMany({
    where: { categoryId },
    orderBy: { sortOrder: "asc" },
    include: { attribute: true },
  });
  return rows.map((r) => ({
    key: r.attribute.key,
    label: r.attribute.label,
    type: r.attribute.type,
    options: r.attribute.options,
    maxLength: r.attribute.maxLength,
    required: r.required,
  }));
}

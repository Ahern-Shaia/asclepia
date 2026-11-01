import { z } from "zod";
import type { PublicQuery } from "@/modules/catalog/server/public/catalog";

// Route input is user input (stack-rules S3-5): parsed here, never passed through raw.
// Ids are cuids; the bound is loose on purpose (anything else simply isn't found).
export const productId = z.string().regex(/^[a-z0-9]{1,40}$/);

type Raw = Record<string, string | string[] | undefined>;
const first = (v: Raw[string]) => (Array.isArray(v) ? v[0] : v);
const attrKey = /^[a-z][a-z0-9_]{0,31}$/; // AttributeDef.key (site-config.md §4.1)

const listSchema = z.object({
  cat: productId.optional().catch(undefined),
  q: z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.slice(0, 100))
    .optional()
    .catch(undefined),
  sort: z.enum(["new", "priceAsc", "priceDesc"]).optional().catch(undefined),
  cursor: productId.optional().catch(undefined),
});

// `f.<key>=value` (repeatable) → filters. Unknown keys are dropped by the catalog read itself.
export function listQuery(raw: Raw): PublicQuery {
  const filters: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.slice(2);
    if (!k.startsWith("f.") || !attrKey.test(key) || Object.keys(filters).length >= 20) continue;
    const values = (Array.isArray(v) ? v : [v])
      .filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 60)
      .slice(0, 20);
    if (values.length) filters[key] = values;
  }
  const scalars = listSchema.parse({
    cat: first(raw.cat),
    q: first(raw.q),
    sort: first(raw.sort),
    cursor: first(raw.cursor),
  });
  return { ...scalars, ...(Object.keys(filters).length ? { filters } : {}) };
}

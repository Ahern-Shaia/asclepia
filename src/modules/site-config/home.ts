import { z } from "zod";

// Home page blocks (site-config.md §4.4): the hero is always first (the site's only search box is
// there, §B0) and the footer always last; these five can be switched off and reordered.
export const HOME_BLOCKS = ["categories", "latest", "brands", "buy", "services"] as const;
export type HomeBlock = (typeof HOME_BLOCKS)[number];
export type HomeLayout = { id: HomeBlock; on: boolean }[];
export const DEFAULT_HOME: HomeLayout = HOME_BLOCKS.map((id) => ({ id, on: true }));

const row = z.object({ id: z.enum(HOME_BLOCKS), on: z.boolean().catch(true) });

// Lenient: unknown or repeated entries are dropped, and a block missing from the stored list
// (one added after the save) comes back switched on at the end.
export function readHome(value: unknown): HomeLayout {
  const raw = (value as { blocks?: unknown } | null)?.blocks;
  const seen = new Set<HomeBlock>();
  const out: HomeLayout = [];
  for (const x of Array.isArray(raw) ? raw : []) {
    const r = row.safeParse(x);
    if (r.success && !seen.has(r.data.id)) {
      seen.add(r.data.id);
      out.push(r.data);
    }
  }
  for (const id of HOME_BLOCKS) if (!seen.has(id)) out.push({ id, on: true });
  return out;
}

// Strict, for the back office: every block exactly once.
export const homeInputSchema = z
  .array(z.object({ id: z.enum(HOME_BLOCKS), on: z.boolean() }))
  .length(HOME_BLOCKS.length)
  .refine((rows) => new Set(rows.map((r) => r.id)).size === HOME_BLOCKS.length);

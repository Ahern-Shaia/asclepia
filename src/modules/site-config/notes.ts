import { z } from "zod";

// Business statements the store chooses to show (user 2026-11-01: none by default, set in the back
// office): hero eyebrow + points, the product page's terms, and the home "services" list. Stored
// in SiteConfig COPY. Each list drops its malformed items instead of failing as a whole, so one bad
// entry never blanks the rest (memory pitfall: strict schema breaks the whole list).
export const SERVICE_KINDS = ["buy", "repair", "rent", "other"] as const;
// Shared by the lenient reader below and the strict back-office input (admin-input.ts).
export const NOTE_LIMITS = {
  eyebrow: 30,
  heroPoints: { count: 3, length: 20 },
  terms: { count: 8, length: 120 },
  services: { count: 4, title: 10, body: 40 },
} as const;
const L = NOTE_LIMITS;
const service = z.object({
  kind: z.enum(SERVICE_KINDS).catch("other"),
  title: z.string().trim().min(1).max(L.services.title),
  body: z.string().trim().max(L.services.body).catch(""),
});
const text = (max: number) => z.string().trim().min(1).max(max);
const listOf = <T extends z.ZodType>(item: T, max: number) =>
  z
    .array(z.unknown())
    .catch([])
    .transform((xs) =>
      xs
        .flatMap((x) => {
          const r = item.safeParse(x);
          return r.success ? [r.data as z.output<T>] : [];
        })
        .slice(0, max),
    );

export const siteNotesSchema = z.object({
  eyebrow: z.string().trim().max(L.eyebrow).catch(""),
  heroPoints: listOf(text(L.heroPoints.length), L.heroPoints.count),
  terms: listOf(text(L.terms.length), L.terms.count),
  services: listOf(service, L.services.count),
});
export type SiteNotes = z.output<typeof siteNotesSchema>;
export type ServiceKind = (typeof SERVICE_KINDS)[number];
export const noNotes: SiteNotes = siteNotesSchema.parse({});

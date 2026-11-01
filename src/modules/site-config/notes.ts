import { z } from "zod";

// Business statements the store chooses to show (user 2026-11-01: none by default, set in the back
// office): hero eyebrow + points, the product page's terms, and the home "services" list. Stored
// in SiteConfig COPY. Each list drops its malformed items instead of failing as a whole, so one bad
// entry never blanks the rest (memory pitfall: strict schema breaks the whole list).
const SERVICE_KINDS = ["buy", "repair", "rent", "other"] as const;
const service = z.object({
  kind: z.enum(SERVICE_KINDS).catch("other"),
  title: z.string().trim().min(1).max(10),
  body: z.string().trim().max(40).catch(""),
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
  eyebrow: z.string().trim().max(30).catch(""),
  heroPoints: listOf(text(20), 3),
  terms: listOf(text(120), 8),
  services: listOf(service, 4),
});
export type SiteNotes = z.output<typeof siteNotesSchema>;
export type ServiceKind = (typeof SERVICE_KINDS)[number];
export const noNotes: SiteNotes = siteNotesSchema.parse({});

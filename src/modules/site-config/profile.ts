import { z } from "zod";
import { siteCopy } from "@/copy/site";

// Store details shown on every public page (site-config.md G1), stored in SiteConfig PROFILE.
// Reading is lenient: a missing or malformed key falls back to its default, so a bad row never
// takes the site down (site-config.md §7-bis 失效). Writing goes through admin-input.ts.
export const profileSchema = z.object({
  name: z.string().min(1).catch(siteCopy.name),
  tagline: z.string().catch(siteCopy.tagline),
  phone: z.string().catch(""),
  email: z.string().catch(""),
  address: z.string().catch(""),
  hours: z.string().catch(""),
});
export type SiteProfile = z.infer<typeof profileSchema>;
export const PROFILE_LIMITS = {
  name: 30,
  tagline: 20,
  phone: 20,
  email: 80,
  address: 80,
  hours: 40,
};

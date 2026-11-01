"use server";

// Server Actions are public POST endpoints imported by client components (as references), so this
// file holds no DB access itself: every export goes through adminAction.

import { updateTag } from "next/cache";
import { adminCopy } from "@/copy/admin";
import { findEfficacyWords } from "@/modules/catalog";
import { adminAction } from "@/server/action";
import { restoreSettingsSchema, saveNotesSchema, saveProfileSchema } from "./admin-input";
import { restoreSection, saveSection } from "./server/admin";

// Public reads of settings are tagged "site-config" (server/public/*.ts).
const invalidate = () => updateTag("site-config");

export const saveProfileAction = adminAction(
  "site-config.profile",
  saveProfileSchema,
  async ({ value, expectedVersion }, admin) => {
    const r = await saveSection("PROFILE", value, expectedVersion, admin.email);
    invalidate();
    return { data: r };
  },
);

// Same efficacy-word check as product copy (R11②): warn and record, don't block.
export const saveNotesAction = adminAction(
  "site-config.notes",
  saveNotesSchema,
  async ({ value, expectedVersion }, admin) => {
    const text = [
      value.eyebrow,
      ...value.heroPoints,
      ...value.terms,
      ...value.services.flatMap((x) => [x.title, x.body]),
    ].join("\n");
    const words = findEfficacyWords(text);
    const r = await saveSection(
      "COPY",
      value,
      expectedVersion,
      admin.email,
      words.length ? { efficacyWords: words } : {},
    );
    invalidate();
    return {
      data: r,
      warnings: words.length ? [adminCopy.settings.notes.efficacyWarning(words.join("、"))] : [],
    };
  },
);

export const restoreSettingsAction = adminAction(
  "site-config.restore",
  restoreSettingsSchema,
  async ({ section, expectedVersion }, admin) => {
    const r = await restoreSection(section, expectedVersion, admin.email);
    invalidate();
    return { data: r };
  },
);

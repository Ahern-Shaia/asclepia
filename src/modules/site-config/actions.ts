"use server";

// Server Actions are public POST endpoints imported by client components (as references), so this
// file holds no DB access itself: every export goes through adminAction.

import { updateTag } from "next/cache";
import { z } from "zod";
import { adminCopy } from "@/copy/admin";
import { findEfficacyWords } from "@/modules/catalog";
import { adminAction } from "@/server/action";
import {
  restoreSettingsSchema,
  saveCopySchema,
  saveFeaturesSchema,
  saveHomeSchema,
  saveProfileSchema,
  saveThemeSchema,
} from "./admin-input";
import { brandNameSchema, siteImageKindSchema } from "./images";
import { restoreSection, saveSection } from "./server/admin";
import { removeBrandLogo, removeSiteImage, reorderBrandLogos } from "./server/images";

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
export const saveCopyAction = adminAction(
  "site-config.copy",
  saveCopySchema,
  async ({ value, expectedVersion }, admin) => {
    const text = [
      value.eyebrow,
      ...value.heroPoints,
      ...value.heading,
      ...value.steps.flatMap((x) => [x.title, x.body]),
      ...value.terms,
      ...value.services.flatMap((x) => [x.title, x.body]),
      value.footerLine,
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

export const saveFeaturesAction = adminAction(
  "site-config.features",
  saveFeaturesSchema,
  async ({ value, expectedVersion }, admin) => {
    const r = await saveSection("FEATURES", value, expectedVersion, admin.email);
    invalidate();
    return { data: r };
  },
);

// The contrast gate is in saveThemeSchema: a failing pair never reaches the database.
export const saveThemeAction = adminAction(
  "site-config.theme",
  saveThemeSchema,
  async ({ value, expectedVersion }, admin) => {
    const r = await saveSection("THEME", value, expectedVersion, admin.email);
    invalidate();
    return { data: r };
  },
);

export const saveHomeAction = adminAction(
  "site-config.home",
  saveHomeSchema,
  async ({ value, expectedVersion }, admin) => {
    const r = await saveSection("HOME", value, expectedVersion, admin.email);
    invalidate();
    return { data: r };
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

export const removeSiteImageAction = adminAction(
  "site-config.image.remove",
  z.object({ kind: siteImageKindSchema }),
  async ({ kind }, admin) => {
    const r = await removeSiteImage(kind, admin.email);
    invalidate();
    return { data: r };
  },
);

export const removeBrandLogoAction = adminAction(
  "site-config.brand-logo.remove",
  z.object({ brand: brandNameSchema }),
  async ({ brand }, admin) => {
    const r = await removeBrandLogo(brand, admin.email);
    invalidate();
    return { data: r };
  },
);

export const reorderBrandLogosAction = adminAction(
  "site-config.brand-logo.reorder",
  z.object({ brands: z.array(brandNameSchema).max(200) }),
  async ({ brands }, admin) => {
    const r = await reorderBrandLogos(brands, admin.email);
    invalidate();
    return { data: r };
  },
);

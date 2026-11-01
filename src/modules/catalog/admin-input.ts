import { z } from "zod";
import { validationCopy as v } from "@/copy/validation";
import { productInputSchema } from "./product-input";

// Back-office action inputs (catalog.md A1, site-config.md §4.1). Shared by forms and actions.
const id = z.string().min(1).max(40);
const label = (name: string, max: number) =>
  z.string().trim().min(1, v.required(name)).max(max, v.tooLong(name, max));

export const productStatuses = ["DRAFT", "PUBLISHED", "HIDDEN", "SOLD"] as const;

export const saveProductSchema = z.object({
  id: id.optional(),
  expectedUpdatedAt: z.iso.datetime().optional(), // optimistic lock
  input: productInputSchema,
});

export const changeStatusSchema = z.object({
  id,
  to: z.enum(productStatuses),
  expectedUpdatedAt: z.iso.datetime().optional(),
});

export const idSchema = z.object({ id });

export const categorySchema = z.object({ id: id.optional(), name: label("分類名稱", 30) });
export const reorderSchema = z.object({ ids: z.array(id).min(1).max(200) });

export const ATTRIBUTE_KEY = /^[a-z][a-z0-9_]{0,31}$/;
export const attributeTypes = ["TEXT", "NUMBER", "YEAR", "SELECT"] as const;

export const attributeDefSchema = z
  .object({
    id: id.optional(),
    key: z.string().regex(ATTRIBUTE_KEY, "代號只能用小寫英文、數字和底線，開頭是英文，最多 32 字"),
    label: label("欄位名稱", 30),
    type: z.enum(attributeTypes),
    options: z
      .array(z.string().trim().min(1).max(30, v.tooLong("選項", 30)))
      .max(50, v.tooMany("選項", 50))
      .default([]),
    unit: z
      .string()
      .trim()
      .max(10, v.tooLong("單位", 10))
      .optional()
      .transform((s) => s || null),
    maxLength: z
      .number()
      .int()
      .min(1)
      .max(500)
      .nullable()
      .optional()
      .transform((n) => n ?? null),
  })
  .refine((d) => d.type !== "SELECT" || d.options.length > 0, {
    path: ["options"],
    message: "選項類型至少要有一個選項",
  })
  .refine((d) => new Set(d.options).size === d.options.length, {
    path: ["options"],
    message: "選項不能重複",
  });

export const categoryConfigSchema = z.object({
  categoryId: id,
  rows: z
    .array(
      z.object({
        attributeId: id,
        required: z.boolean(),
        inTitle: z.boolean(),
        onCard: z.boolean(),
        inNameplate: z.boolean(),
        filterable: z.boolean(),
      }),
    )
    .max(50),
});

import { z } from "zod";
import { shopCopy } from "@/copy/shop";
import { validationCopy as v } from "@/copy/validation";

// inquiry.md §4.2 step 1 / §7-bis.1. Shared by the form (hints) and the action (authority).
export const INQUIRY_MAX = 10; // OQ-INQ-4
const c = shopCopy.inquiry.required;
const optional = (label: string, max: number) =>
  z
    .string()
    .trim()
    .max(max, v.tooLong(label, max))
    .optional()
    .transform((s) => s || null);

export const submitInquirySchema = z.object({
  productIds: z
    .array(z.string().min(1).max(40))
    .min(1)
    .max(INQUIRY_MAX, v.tooMany("詢價商品", INQUIRY_MAX))
    .refine((ids) => new Set(ids).size === ids.length),
  name: z.string().trim().min(1, c.name).max(50, v.tooLong("姓名", 50)),
  phone: z
    .string()
    .trim()
    .min(1, c.phone)
    .max(30, v.tooLong("聯絡電話", 30))
    .regex(/^[0-9 +\-()#]+$/, c.phoneFormat),
  email: z
    .union([z.literal(""), z.email("Email 格式不對，例：name@example.com").max(254)])
    .optional()
    .transform((s) => s || null),
  org: optional("單位／公司", 100),
  message: optional("想了解什麼", 2000),
  consent: z.literal(true, c.consent),
});

export type SubmitInquiry = z.output<typeof submitInquirySchema>;

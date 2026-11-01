import { z } from "zod";
import { validationCopy as v } from "@/copy/validation";

// Back-office inquiry inputs (inquiry.md B4). Shared by the detail form and the actions.
export const INQUIRY_STATUSES = ["NEW", "CONTACTED", "CLOSED_WON", "CLOSED_LOST"] as const;
export type InquiryStatusValue = (typeof INQUIRY_STATUSES)[number];

const id = z.string().min(1).max(40);
const status = z.enum(INQUIRY_STATUSES);

export const updateInquirySchema = z.object({
  id,
  status,
  note: z
    .string()
    .trim()
    .max(2000, v.tooLong("內部備註", 2000))
    .transform((s) => s || null),
  // What the form was opened with: the save only applies if nobody changed it meanwhile.
  expected: z.object({ status, note: z.string().max(2000).nullable() }),
});

export const inquiryIdSchema = z.object({ id });

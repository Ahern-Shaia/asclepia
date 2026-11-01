"use server";

// Server Actions are public POST endpoints: every export goes through publicAction/adminAction.
import { adminAction, publicAction } from "@/server/action";
import { inquiryIdSchema, updateInquirySchema } from "./admin-input";
import { submitInquirySchema } from "./input";
import { deleteInquiry, updateInquiry } from "./server/admin";
import { submitInquiry } from "./server/submit";

// Signed-out buyers send inquiries. Rate-limited first (inquiry.md §4.2 step 2).
export const submitInquiryAction = publicAction(
  "inquiry.submit",
  submitInquirySchema,
  { max: 5, windowSec: 600 },
  async (input) => ({ data: await submitInquiry(input) }),
);

// Back office (inquiry.md B4). Admin pages are dynamic, so there is no cache to invalidate.
export const updateInquiryAction = adminAction(
  "inquiry.update",
  updateInquirySchema,
  async (input, admin) => ({ data: await updateInquiry(input, admin.email) }),
);

export const deleteInquiryAction = adminAction(
  "inquiry.delete",
  inquiryIdSchema,
  async ({ id }, admin) => ({ data: await deleteInquiry(id, admin.email) }),
);

"use server";

// Public Server Action: signed-out buyers send inquiries. Rate-limited first (inquiry.md §4.2 step 2).
import { publicAction } from "@/server/action";
import { submitInquirySchema } from "./input";
import { submitInquiry } from "./server/submit";

export const submitInquiryAction = publicAction(
  "inquiry.submit",
  submitInquirySchema,
  { max: 5, windowSec: 600 },
  async (input) => ({ data: await submitInquiry(input) }),
);

import { shopCopy } from "@/copy/shop";

// What the inquiry views need from "send": the real pages pass the public Server Action
// (src/modules/inquiry/actions.ts), mockups a stand-in that never leaves the browser.
export type InquiryValues = {
  name: string;
  phone: string;
  email: string;
  org: string;
  message: string;
  consent: boolean;
};
export type InquiryResult =
  | { ok: true; data: { id: string; titles: string[] } }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string>;
      detail?: string[];
    };
export type SendInquiry = (
  input: InquiryValues & { productIds: string[] },
) => Promise<InquiryResult>;

// What the form shows after a refused send. Unavailable items are the caller's to explain (it knows
// which rows they are); the fallback is a fixed sentence plus the phone, never server text.
export type FormOutcome =
  { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string> };

export function refusal(
  r: Extract<InquiryResult, { ok: false }>,
  phone: string,
): Extract<FormOutcome, { ok: false }> {
  if (r.code === "INVALID") return { ok: false, message: r.message, fieldErrors: r.fieldErrors };
  if (r.code === "RATE_LIMITED") return { ok: false, message: r.message };
  return failed(phone);
}

export const failed = (phone: string): Extract<FormOutcome, { ok: false }> => ({
  ok: false,
  message: [shopCopy.inquiry.failed, phone ? shopCopy.inquiry.orCall(phone) : ""].join(""),
});

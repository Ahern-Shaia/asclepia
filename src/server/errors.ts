import "server-only";
import { type ErrorCode, errorCopy } from "@/copy/errors";
import { log } from "./log";

export type Failure = {
  ok: false;
  code: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string>; // field path → message (already in plain language)
  detail?: string[]; // e.g. what is still missing before publishing
};

// Thrown by modules for expected business outcomes; translated, never shown raw.
export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly extra: { fieldErrors?: Record<string, string>; detail?: string[] } = {},
  ) {
    super(code);
    this.name = "DomainError";
  }
}

const PRISMA_CODES: Record<string, ErrorCode> = {
  P2002: "DUPLICATE", // unique constraint
  P2003: "IN_USE", // foreign key (Restrict)
  P2025: "NOT_FOUND", // record to update/delete not found
};

export const fail = (code: ErrorCode, extra: DomainError["extra"] = {}): Failure => ({
  ok: false,
  code,
  message: errorCopy[code],
  ...extra,
});

// The single translation point (stack-rules S6-1). The fallback is a fixed sentence; the original
// error goes to the redacted log by name/code only.
export function toFailure(e: unknown, action: string): Failure {
  if (e instanceof DomainError) return fail(e.code, e.extra);
  const code = (e as { code?: unknown })?.code;
  if (typeof code === "string" && PRISMA_CODES[code]) return fail(PRISMA_CODES[code]);
  log("error", "action.failed", {
    action,
    errorName: (e as { name?: unknown })?.name,
    errorCode: typeof code === "string" ? code : undefined,
  });
  return fail("UNKNOWN");
}

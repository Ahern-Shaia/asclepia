import "server-only";
import { headers } from "next/headers";
import type { z } from "zod";
import { type Admin, getAdmin } from "./auth";
import { requestEnv } from "./env";
import { type Failure, fail, toFailure } from "./errors";
import { log } from "./log";
import { clientKey, hit } from "./rate-limit";

export type Result<T> = { ok: true; data: T; warnings?: string[] } | Failure;
export type Ok<T> = { data: T; warnings?: string[] };

// Every back-office mutation goes through here (stack-rules S3-1, S4-1): a Server Action is a
// public POST endpoint, so authorisation, input parsing and error translation can't be optional.
export function adminAction<S extends z.ZodType, T>(
  name: string,
  schema: S,
  run: (input: z.output<S>, admin: Admin) => Promise<Ok<T>>,
) {
  return async (raw: unknown): Promise<Result<T>> => {
    const admin = await getAdmin();
    if (!admin) return fail("UNAUTHORIZED");
    const parsed = schema.safeParse(raw);
    if (!parsed.success)
      return fail("INVALID", {
        fieldErrors: Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      });
    try {
      const { data, warnings } = await run(parsed.data, admin);
      return { ok: true, data, ...(warnings?.length ? { warnings } : {}) };
    } catch (e) {
      return toFailure(e, name);
    }
  };
}

// Public (signed-out) mutations, e.g. sending an inquiry. Rate-limited per client before anything
// else runs (stack-rules S4-6); otherwise the same contract as adminAction.
export function publicAction<S extends z.ZodType, T>(
  name: string,
  schema: S,
  limit: { max: number; windowSec: number },
  run: (input: z.output<S>) => Promise<Ok<T>>,
) {
  return async (raw: unknown): Promise<Result<T>> => {
    try {
      const h = await headers();
      const address = h.get(requestEnv().CLIENT_IP_HEADER)?.split(",")[0]?.trim() || "unknown";
      const r = await hit(clientKey(name, address), limit.max, limit.windowSec);
      if (!r.allowed) {
        log("warn", "action.rate_limited", { action: name, count: r.count });
        return fail("RATE_LIMITED");
      }
    } catch (e) {
      return toFailure(e, name);
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success)
      return fail("INVALID", {
        fieldErrors: Object.fromEntries(
          parsed.error.issues.map((i) => [i.path.join("."), i.message]),
        ),
      });
    try {
      const { data, warnings } = await run(parsed.data);
      return { ok: true, data, ...(warnings?.length ? { warnings } : {}) };
    } catch (e) {
      return toFailure(e, name);
    }
  };
}

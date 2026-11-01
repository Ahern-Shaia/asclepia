import "server-only";
import type { z } from "zod";
import { type Admin, getAdmin } from "./auth";
import { type Failure, fail, toFailure } from "./errors";

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

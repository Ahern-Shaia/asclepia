"use client";

import { Alert, Button, Flex } from "antd";
import { useRouter } from "next/navigation";
import { adminCopy } from "@/copy/admin";
import { errorCopy } from "@/copy/errors";
import type { Result } from "@/server/action";

export type Failure = Extract<Result<unknown>, { ok: false }>;

// Server Actions return a Result; a dropped connection or a server crash rejects instead. Both end
// up as a Failure so callers handle one shape, and the person never sees a raw error.
export async function call<I, T>(action: (input: I) => Promise<Result<T>>, input: I) {
  try {
    return await action(input);
  } catch {
    return { ok: false, code: "UNKNOWN", message: errorCopy.UNKNOWN } satisfies Failure;
  }
}

type FieldError = { name: (string | number)[]; errors: string[] };

// Server field paths ("input.specs.2.label", "attributes.brand", "categoryId") → antd field names.
// Paths that match no field on the form are returned as `rest` so they are still shown.
export function fieldErrorsFor(
  fieldErrors: Record<string, string> | undefined,
  known: (name: (string | number)[]) => boolean,
  strip = "input.",
): { fields: FieldError[]; rest: string[] } {
  const fields: FieldError[] = [];
  const rest: string[] = [];
  for (const [path, message] of Object.entries(fieldErrors ?? {})) {
    const name = (path.startsWith(strip) ? path.slice(strip.length) : path)
      .split(".")
      .map((p) => (/^\d+$/.test(p) ? Number(p) : p));
    if (known(name)) fields.push({ name, errors: [message] });
    else rest.push(message);
  }
  return { fields, rest };
}

// What a failed action says: the sentence, then the itemised detail, then the way forward.
export function FailureAlert({ failure, extra = [] }: { failure: Failure; extra?: string[] }) {
  const router = useRouter();
  const items = [...(failure.detail ?? []), ...extra];
  const action =
    failure.code === "CONFLICT" || failure.code === "NOT_FOUND" ? (
      <Button size="small" onClick={() => router.refresh()}>
        {adminCopy.edit.reload}
      </Button>
    ) : failure.code === "UNAUTHORIZED" ? (
      <Button size="small" href="/admin/login">
        {adminCopy.edit.signInAgain}
      </Button>
    ) : undefined;
  return (
    <Alert
      type="error"
      showIcon
      title={failure.message}
      description={
        items.length ? (
          <ul style={{ paddingInlineStart: 20 }}>
            {items.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : undefined
      }
      action={action ? <Flex>{action}</Flex> : undefined}
    />
  );
}

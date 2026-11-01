import "server-only";

// Structured logs with personal data removed (stack-rules S6-2, security-baseline §0 #3).
const REDACT = /^(email|phone|name|org|message|cookie|authorization|password|secret|token)$/i;
const MAX_DEPTH = 4;

function redact(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      REDACT.test(k) ? "[redacted]" : redact(v, depth + 1),
    ]),
  );
}

export function log(level: "info" | "warn" | "error", event: string, fields: object = {}) {
  const line = JSON.stringify({
    level,
    event,
    at: new Date().toISOString(),
    ...(redact(fields) as object),
  });
  if (level === "error") console.error(line);
  else console.log(line);
}

export const redactForTest = redact;

import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { type Db, db } from "./db";
import { requestEnv } from "./env";

// Fixed-window counter in Postgres (stack-rules S4-6; user 2026-11-01). One statement per hit.
const processKey = randomBytes(32);

export function clientKey(scope: string, address: string) {
  const secret = requestEnv().RATE_LIMIT_SECRET ?? processKey;
  return `${scope}:${createHmac("sha256", secret).update(address).digest("hex").slice(0, 32)}`;
}

export async function hit(key: string, limit: number, windowSec: number, client: Db = db()) {
  const windowStart = new Date(Math.floor(Date.now() / (windowSec * 1000)) * windowSec * 1000);
  const [row] = await client.$queryRaw<{ count: number }[]>`
    insert into "RateLimitHit" ("key", "windowStart", "count") values (${key}, ${windowStart}, 1)
    on conflict ("key", "windowStart") do update set "count" = "RateLimitHit"."count" + 1
    returning "count"`;
  return { allowed: row.count <= limit, count: row.count };
}

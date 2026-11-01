import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { DB_BUDGET } from "./budget";
import { dbEnv } from "./env";

// The only place a PrismaClient / pool is constructed (stack-rules P5-1). Connects as the
// low-privilege app role (DATABASE_URL); migrations use MIGRATE_DATABASE_URL via prisma7.config.ts.
export function createDb(
  connectionString: string,
  poolMax: number,
  opts: { logQueries?: boolean } = {},
) {
  const adapter = new PrismaPg({
    connectionString,
    max: poolMax,
    connectionTimeoutMillis: DB_BUDGET.acquireMs,
    statement_timeout: DB_BUDGET.statementMs,
    query_timeout: DB_BUDGET.queryMs,
    idleTimeoutMillis: DB_BUDGET.idleMs,
  });
  return new PrismaClient({
    adapter,
    // Query events feed the query-count assertions in tests (stack-rules P1-1).
    log: opts.logQueries ? [{ emit: "event", level: "query" }] : [],
    transactionOptions: {
      maxWait: DB_BUDGET.transactionMaxWaitMs,
      timeout: DB_BUDGET.transactionMs,
    },
  });
}

export type Db = ReturnType<typeof createDb>;

// One client per process; dev keeps it on globalThis so HMR reloads don't open new pools.
const cache = globalThis as unknown as { __asclepiaDb?: Db };

export function db(): Db {
  if (!cache.__asclepiaDb) {
    const env = dbEnv();
    cache.__asclepiaDb = createDb(env.DATABASE_URL, env.DB_POOL_MAX);
  }
  return cache.__asclepiaDb;
}

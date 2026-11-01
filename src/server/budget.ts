import "server-only";

// Per-layer timeouts (stack-rules P3-1, P3-2, P3-5). These are ceilings that make a stuck call fail
// fast, not targets: the targets are performance-baseline §0 (p95 read ≤ 300ms, write ≤ 800ms).
// Worst case for one write request: acquire 2s + statement 5s, well under the 30s image budget.
export const DB_BUDGET = {
  acquireMs: 2_000, // wait for a pooled connection (pg default 0 = forever)
  statementMs: 5_000, // server-side statement_timeout (pg default: none)
  queryMs: 6_000, // client-side query_timeout, a little above statementMs so the server reports first
  idleMs: 10_000,
  transactionMaxWaitMs: 2_000,
  transactionMs: 5_000,
} as const;

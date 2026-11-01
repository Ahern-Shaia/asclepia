import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { type Db, db } from "./db";

export type AuditEntry = {
  actorId: string; // admin email, or "system" / "anonymous"
  action: string; // e.g. "auth.signIn", "product.publish"
  targetType: string;
  targetId: string;
  result: "ok" | "denied" | "error" | "warn";
  diff?: Prisma.InputJsonValue; // never personal data
};

// Every write is audited (R5). Always awaited: a floating audit write that fails after the response
// is an audit record nobody knows is missing (stack-rules P4-3).
export async function audit(entry: AuditEntry, client: Pick<Db, "auditLog"> = db()) {
  await client.auditLog.create({ data: entry });
}

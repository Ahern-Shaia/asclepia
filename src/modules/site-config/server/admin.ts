import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { audit } from "@/server/audit";
import { type Db, db } from "@/server/db";
import { DomainError } from "@/server/errors";
import type { SettingsSection } from "../admin-input";
import { siteNotesSchema } from "../notes";
import { profileSchema } from "../profile";

// 站台設定 writes (site-config.md §4.2, OQ-CFG-6). Each section is one JSON document with a version
// for the optimistic lock. Every save and restore is audited with the whole value before and after:
// that audit trail is the change history and the source of 「還原上一版」. Store details are the
// shop's public contact, not a buyer's personal data.
const TARGET = "site-config";
const WRITES = ["site-config.save", "site-config.restore"];
type Json = Prisma.InputJsonValue;
const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export async function getSettings(client: Db = db()) {
  const [rows, ...last] = await Promise.all([
    client.siteConfig.findMany({ where: { section: { in: ["PROFILE", "COPY"] } } }),
    ...(["PROFILE", "COPY"] as const).map((s) =>
      client.auditLog.findFirst({
        where: { targetType: TARGET, targetId: s, action: { in: WRITES } },
        orderBy: [{ at: "desc" }, { id: "desc" }],
        select: { id: true },
      }),
    ),
  ]);
  const meta = (section: SettingsSection, i: number) => {
    const row = rows.find((r) => r.section === section);
    return {
      version: row?.version ?? 0,
      savedAt: row?.updatedAt ?? null,
      savedBy: row?.updatedBy ?? null,
      canRestore: last[i] !== null,
    };
  };
  const value = (section: SettingsSection) =>
    asObject(rows.find((r) => r.section === section)?.value);
  return {
    profile: {
      ...meta("PROFILE", 0),
      value: profileSchema.parse({ ...profileSchema.parse({}), ...value("PROFILE") }),
    },
    notes: { ...meta("COPY", 1), value: siteNotesSchema.parse(value("COPY")) },
  };
}

async function write(
  section: SettingsSection,
  next: (current: Record<string, unknown>) => Record<string, unknown>,
  expectedVersion: number,
  actor: string,
  action: string,
  extra: Record<string, Json> = {},
  client: Db = db(),
) {
  return client.$transaction(async (tx) => {
    const row = await tx.siteConfig.findUnique({ where: { section } });
    if ((row?.version ?? 0) !== expectedVersion) throw new DomainError("CONFLICT");
    const from = asObject(row?.value);
    const to = next(from);
    if (row) {
      const n = await tx.siteConfig.updateMany({
        where: { section, version: expectedVersion },
        data: { value: to as Json, version: { increment: 1 }, updatedBy: actor },
      });
      if (n.count === 0) throw new DomainError("CONFLICT");
    } else {
      // two first saves at once: the second hits the primary key — same answer as a stale version
      await tx.siteConfig
        .create({ data: { section, value: to as Json, version: 1, updatedBy: actor } })
        .catch((e: unknown) => {
          throw (e as { code?: string }).code === "P2002" ? new DomainError("CONFLICT") : e;
        });
    }
    await audit(
      {
        actorId: actor,
        action,
        targetType: TARGET,
        targetId: section,
        result: "efficacyWords" in extra ? "warn" : "ok",
        diff: { from: from as Json, to: to as Json, ...extra },
      },
      tx,
    );
    return { version: expectedVersion + 1 };
  });
}

// Saves only the keys this editor owns; keys other editors add to the same section stay.
export function saveSection(
  section: SettingsSection,
  value: Record<string, unknown>,
  expectedVersion: number,
  actor: string,
  extra: Record<string, Json> = {},
  client: Db = db(),
) {
  return write(
    section,
    (cur) => ({ ...cur, ...value }),
    expectedVersion,
    actor,
    "site-config.save",
    extra,
    client,
  );
}

// Puts back the value from before the latest save or restore (restoring twice undoes the restore).
export async function restoreSection(
  section: SettingsSection,
  expectedVersion: number,
  actor: string,
  client: Db = db(),
) {
  const last = await client.auditLog.findFirst({
    where: { targetType: TARGET, targetId: section, action: { in: WRITES } },
    orderBy: [{ at: "desc" }, { id: "desc" }],
    select: { diff: true },
  });
  if (!last) throw new DomainError("NOT_FOUND");
  const previous = asObject(asObject(last.diff).from);
  return write(section, () => previous, expectedVersion, actor, "site-config.restore", {}, client);
}

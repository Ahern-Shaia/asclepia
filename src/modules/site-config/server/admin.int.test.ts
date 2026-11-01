import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, inject, it } from "vitest";
import { createDb } from "@/server/db";
import { DomainError } from "@/server/errors";
import { notesInputSchema, profileInputSchema } from "../admin-input";
import { getSettings, restoreSection, saveSection } from "./admin";

// 站台設定 on the low-privilege app role (site-config.md §4.2, OQ-CFG-6). SiteConfig is one row per
// section for the whole site; only this file writes it, and its tests run in order.
const db = createDb(inject("appDatabaseUrl"), 3, { logQueries: true });
let queries = 0;
db.$on("query", () => {
  queries += 1;
});
const actor = `admin-${randomUUID().slice(0, 8)}@example.com`;
afterAll(() => db.$disconnect());

const codeOf = async (p: Promise<unknown>) => {
  try {
    await p;
    return "resolved";
  } catch (e) {
    return e instanceof DomainError ? e.code : "other";
  }
};
const profile = (phone: string) =>
  profileInputSchema.parse({
    name: "測試設備行",
    tagline: "中古設備",
    phone,
    email: "",
    address: "台北市範例路 1 號",
    hours: "週一至週五 9–18",
  });
const lastAudit = (section: string) =>
  db.auditLog.findFirstOrThrow({
    where: { targetType: "site-config", targetId: section },
    orderBy: [{ at: "desc" }, { id: "desc" }],
  });

describe("site settings", () => {
  it("starts on defaults with nothing to restore, within the query budget", async () => {
    queries = 0;
    const s = await getSettings(db);
    expect(queries).toBeLessThanOrEqual(3);
    expect(s.profile).toMatchObject({ version: 0, canRestore: false, savedBy: null });
    expect(s.profile.value.name).toBe("Asclepia");
    expect(s.notes.value).toEqual({ eyebrow: "", heroPoints: [], terms: [], services: [] });
  });

  it("saves, refuses a stale version, and audits the whole value before and after", async () => {
    expect(await saveSection("PROFILE", profile("02-1111-2222"), 0, actor, {}, db)).toEqual({
      version: 1,
    });
    expect(await codeOf(saveSection("PROFILE", profile("02-9999"), 0, actor, {}, db))).toBe(
      "CONFLICT",
    );
    await saveSection("PROFILE", profile("02-3333-4444"), 1, actor, {}, db);
    const s = await getSettings(db);
    expect(s.profile).toMatchObject({ version: 2, savedBy: actor, canRestore: true });
    expect(s.profile.value.phone).toBe("02-3333-4444");
    expect((await lastAudit("PROFILE")).diff).toMatchObject({
      from: { phone: "02-1111-2222" },
      to: { phone: "02-3333-4444" },
    });
  });

  it("keeps keys it doesn't own, and restore puts back the value before the last write", async () => {
    await db.siteConfig.update({
      where: { section: "PROFILE" },
      data: { value: { ...profile("02-3333-4444"), map: "https://maps.example/x" } },
    });
    await saveSection("PROFILE", profile("02-5555"), 2, actor, {}, db);
    const raw = await db.siteConfig.findUniqueOrThrow({ where: { section: "PROFILE" } });
    expect(raw.value).toMatchObject({ phone: "02-5555", map: "https://maps.example/x" });

    await restoreSection("PROFILE", 3, actor, db);
    expect((await getSettings(db)).profile.value.phone).toBe("02-3333-4444");
    expect((await lastAudit("PROFILE")).action).toBe("site-config.restore");
    await restoreSection("PROFILE", 4, actor, db); // restoring again undoes the restore
    expect((await getSettings(db)).profile.value.phone).toBe("02-5555");
    expect(await codeOf(restoreSection("PROFILE", 4, actor, db))).toBe("CONFLICT");
  });

  it("restoring the first save of a section goes back to the defaults", async () => {
    const notes = notesInputSchema.parse({
      eyebrow: "自有庫存",
      heroPoints: ["可開立發票"],
      terms: [],
      services: [{ kind: "buy", title: "收購", body: "" }],
    });
    await saveSection("COPY", notes, 0, actor, { efficacyWords: ["治療"] }, db);
    const audit = await lastAudit("COPY");
    expect(audit).toMatchObject({ result: "warn", diff: { efficacyWords: ["治療"], from: {} } });
    expect((await getSettings(db)).notes.value.heroPoints).toEqual(["可開立發票"]);
    await restoreSection("COPY", 1, actor, db);
    expect((await getSettings(db)).notes.value).toEqual({
      eyebrow: "",
      heroPoints: [],
      terms: [],
      services: [],
    });
  });

  it("refuses input the public side would cut or drop", () => {
    const bad = notesInputSchema.safeParse({
      eyebrow: "",
      heroPoints: ["一", "二", "三", "四"],
      terms: [""],
      services: [],
    });
    expect(bad.success).toBe(false);
    expect(bad.error?.issues.map((i) => i.path.join("."))).toEqual(
      expect.arrayContaining(["heroPoints", "terms.0"]),
    );
    expect(profileInputSchema.safeParse({ ...profile("02"), phone: "call me" }).success).toBe(
      false,
    );
  });
});

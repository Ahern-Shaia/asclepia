import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// User 2026-11-01: no data-handling taglines on the public site ("保留 1 年後刪除" and the like:
// retention periods, "only used for", privacy promises). The back office (admin.ts) may state
// the retention rule to staff. Reads the source so template strings are covered too.
const DATA_HANDLING = /保留\s*\d|\d\s*(年|個月|天)後(自動)?刪除|只用於|個資|隱私/;
const dir = fileURLToPath(new URL(".", import.meta.url));
const publicCopy = readdirSync(dir).filter(
  (f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== "admin.ts",
);

describe("public copy", () => {
  it("covers the shop and catalog copy", () => {
    expect(publicCopy).toEqual(expect.arrayContaining(["shop.ts", "catalog.ts", "site.ts"]));
  });

  it.each(publicCopy)("%s has no data-handling taglines", (file) => {
    const hits = readFileSync(join(dir, file), "utf8")
      .split("\n")
      .filter((line) => DATA_HANDLING.test(line));
    expect(hits).toEqual([]);
  });
});

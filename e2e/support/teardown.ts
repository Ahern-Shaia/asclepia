import { rm } from "node:fs/promises";
import { Client } from "pg";
import { E2E_UPLOAD_DIR, e2eDatabaseUrl } from "../../playwright.config";

// Removes what the admin specs created (names start with "e2e-", attribute keys with "e2e_").
// Runs as the app role against the e2e database only.
export default async function teardown() {
  if (!e2eDatabaseUrl.endsWith("/asclepia_e2e")) throw new Error("teardown: not the e2e database");
  const db = new Client({ connectionString: e2eDatabaseUrl });
  await db.connect();
  try {
    await db.query("begin");
    await db.query(
      `delete from "Product" where "categoryId" in (select id from "Category" where name like 'e2e-%')`,
    );
    await db.query(`delete from "Category" where name like 'e2e-%'`);
    await db.query(
      `delete from "CategoryAttribute" where "attributeId" in (select id from "AttributeDef" where key like 'e2e\\_%')`,
    );
    await db.query(`delete from "AttributeDef" where key like 'e2e\\_%'`);
    await db.query("commit");
  } finally {
    await db.end();
  }
  await rm(E2E_UPLOAD_DIR, { recursive: true, force: true });
}

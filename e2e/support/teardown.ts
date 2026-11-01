import { rm } from "node:fs/promises";
import { Client } from "pg";
import { E2E_UPLOAD_DIR, e2eDatabaseUrl } from "../../playwright.config";

// Removes what the specs created (names start with "e2e-", attribute keys with "e2e_").
// Runs as the app role against the e2e database only.
export default async function teardown() {
  if (!e2eDatabaseUrl.endsWith("/asclepia_e2e")) throw new Error("teardown: not the e2e database");
  const db = new Client({ connectionString: e2eDatabaseUrl });
  await db.connect();
  try {
    await db.query("begin");
    // InquiryItem → Product is ON DELETE RESTRICT: inquiries about e2e products go first
    // (their items cascade). AuditLog rows stay (append-only).
    await db.query(
      `delete from "Inquiry" where id in (select "inquiryId" from "InquiryItem" where "productId" in
         (select p.id from "Product" p join "Category" c on c.id = p."categoryId" where c.name like 'e2e-%'))`,
    );
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

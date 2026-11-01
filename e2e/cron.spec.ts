import { expect, test } from "@playwright/test";
import { E2E_CRON_SECRET } from "../playwright.config";
import { uid } from "./support/admin";
import { seedShop, sql } from "./support/shop";

// Daily maintenance endpoint (app/api/cron/daily): only the scheduler's secret runs it, and it
// deletes inquiries past their retention date (inquiry.md §7-bis.5).
test("the daily job runs only with the secret and deletes expired inquiries", async ({
  request,
}, info) => {
  test.skip(info.project.name !== "desktop", "one run is enough: it acts on the whole database");
  const url = "/api/cron/daily";
  expect((await request.post(url)).status()).toBe(401);
  expect((await request.post(url, { headers: { authorization: "Bearer wrong" } })).status()).toBe(
    401,
  );

  const seeded = await seedShop([{ name: "e2e-清除", brand: "Alpha", model: "P-1" }]);
  const id = `e2epurge${uid()}`;
  await sql(
    `insert into "Inquiry" (id, name, phone, "consentText", "createdAt", "purgeAfter")
     values ($1, 'e2e 過期', '02 0000 0000', '同意', now() - interval '400 days', now() - interval '1 day')`,
    [id],
  );
  await sql(
    `insert into "InquiryItem" ("inquiryId", "productId", "sortOrder", "titleSnap") values ($1, $2, 0, 'x')`,
    [id, seeded.products[0].id],
  );

  const ok = await request.post(url, {
    headers: { authorization: `Bearer ${E2E_CRON_SECRET}` },
  });
  expect(ok.status()).toBe(200);
  const body = await ok.json();
  expect(body.inquiriesPurged).toBeGreaterThanOrEqual(1);
  expect(JSON.stringify(body)).not.toContain("e2e 過期");
  expect(await sql(`select 1 from "Inquiry" where id = $1`, [id])).toHaveLength(0);
  expect(await sql(`select 1 from "Product" where id = $1`, [seeded.products[0].id])).toHaveLength(
    1,
  );
});

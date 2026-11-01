import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const PORT = 3100;

// e2e runs against its own database (scripts/db/e2e.sh) and its own auth settings: tests sign in by
// minting a session with E2E_AUTH.secret (e2e/support/session.ts), never through Google.
export const E2E_UPLOAD_DIR = ".uploads-e2e";
export const E2E_CLIENT_HEADER = "x-e2e-client";
export const E2E_AUTH = {
  secret: "e2e-only-secret-not-used-anywhere-else-0123456789",
  admin: "admin@example.com",
};
const SITE_WIDE = /site-settings\.spec\.ts/;

export const e2eDatabaseUrl = (process.env.DATABASE_URL ?? "").replace(
  /\/asclepia$/,
  "/asclepia_e2e",
);

export default defineConfig({
  testDir: "e2e",
  forbidOnly: true,
  // The e2e database persists between runs; specs name their data "e2e-…" / "e2e_…" and this
  // removes it afterwards, so lists stay under their caps (listCategories takes 200).
  globalTeardown: "./e2e/support/teardown.ts",
  reporter: [
    ["list"],
    ["junit", { outputFile: "reports/junit-e2e.xml" }],
    ["html", { open: "never" }],
  ],
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    {
      name: "desktop",
      testIgnore: SITE_WIDE,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      testIgnore: SITE_WIDE,
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
    // Site settings are one document for the whole site: changing them while other specs run would
    // change what those specs see. They run alone, after everything else.
    {
      name: "site-wide",
      testMatch: SITE_WIDE,
      dependencies: ["desktop", "mobile"],
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  // Always our own production server on a dedicated port; never reuse whatever is on :3000.
  webServer: {
    command: `bash scripts/db/e2e.sh && pnpm build && pnpm start -p ${PORT}`,
    env: {
      ...(process.env as Record<string, string>),
      DATABASE_URL: e2eDatabaseUrl,
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      NEXTAUTH_SECRET: E2E_AUTH.secret,
      GOOGLE_CLIENT_ID: "e2e.apps.googleusercontent.com",
      GOOGLE_CLIENT_SECRET: "e2e",
      ADMIN_EMAILS: E2E_AUTH.admin,
      UPLOAD_DIR: E2E_UPLOAD_DIR, // never the dev .uploads/
      // Rate limiting is per client address; each spec sends its own value so specs don't share a
      // bucket (e2e/support/shop.ts asClient).
      CLIENT_IP_HEADER: E2E_CLIENT_HEADER,
    },
    port: PORT,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});

import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const PORT = 3100;

// e2e runs against its own database (scripts/db/e2e.sh) and its own auth settings: tests sign in by
// minting a session with E2E_AUTH.secret (e2e/support/session.ts), never through Google.
export const E2E_AUTH = {
  secret: "e2e-only-secret-not-used-anywhere-else-0123456789",
  admin: "admin@example.com",
};
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
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
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
    },
    port: PORT,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});

import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  forbidOnly: true,
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
    command: `pnpm build && pnpm start -p ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});

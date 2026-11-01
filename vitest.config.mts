import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Red test names must survive any pipe: junit is configured here, not on the command line.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    // `server-only` is resolved by Next at build time; Vitest doesn't go through Next (stack-rules W3).
    alias: { "server-only": fileURLToPath(new URL("./src/test/empty-module.ts", import.meta.url)) },
  },
  test: {
    reporters: ["default", "junit"],
    outputFile: { junit: "reports/junit-vitest.xml" },
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.ts"], exclude: ["src/**/*.int.test.ts"] },
      },
      {
        // Real Postgres via testcontainers, connected as the low-privilege app role (security-baseline §2).
        extends: true,
        test: {
          name: "integration",
          include: ["src/**/*.int.test.ts"],
          globalSetup: ["src/test/global-setup.ts"],
          testTimeout: 120_000,
          hookTimeout: 180_000,
        },
      },
    ],
  },
});

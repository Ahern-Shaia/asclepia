import { defineConfig } from "vitest/config";

// Red test names must survive any pipe: junit is configured here, not on the command line.
export default defineConfig({
  resolve: { tsconfigPaths: true },
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
        test: { name: "integration", include: ["src/**/*.int.test.ts"], testTimeout: 120_000 },
      },
    ],
  },
});

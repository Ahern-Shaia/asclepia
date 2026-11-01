import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Database and secret boundaries (stack-rules P5-1, S5-5). Wired with M1a; the rest of W2 follows
  // with the modules that need it.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name=/^(PrismaClient|PrismaPg|Pool)$/]",
          message: "Construct the database client only in src/server/db.ts (stack-rules P5-1).",
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Read environment variables through src/server/env.ts (stack-rules S5-5).",
        },
      ],
    },
  },
  // Allowed homes, one exemption each. Turning a rule "off" drops every entry in it, so each override
  // names exactly the rule its file needs (stack-rules W2 note).
  { files: ["src/server/db.ts", "src/test/**"], rules: { "no-restricted-syntax": "off" } },
  {
    // proxy.ts reads only the non-secret NODE_ENV / ENABLE_MOCKUPS flags and must not depend on
    // DB/auth env being present (the mockup share site has neither).
    files: ["src/server/env.ts", "src/proxy.ts", "src/test/**"],
    rules: { "no-restricted-properties": "off" },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
    "playwright-report/**",
    "test-results/**",
    "reports/**",
  ]),
]);

export default eslintConfig;

import { inject } from "vitest";

// Public reads answer empty when DATABASE_URL is unset (hasDatabase(), for builds without a
// database). Integration tests get their database from global-setup, not from the shell, so set it
// here; otherwise the public-catalog tests pass or fail depending on who runs them.
process.env.DATABASE_URL = inject("appDatabaseUrl");

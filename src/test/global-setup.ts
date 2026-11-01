// Integration-test database (stack-rules S4-7, security-baseline §2): a throwaway Postgres with the
// real migrations, the real role script, and the app role the production server uses. Tests must
// never connect as the owner/superuser: grants and the audit trigger would pass for the wrong reason.
import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    appDatabaseUrl: string;
    ownerDatabaseUrl: string;
  }
}

const IMAGE = "postgres:16.13-alpine"; // same as compose.yaml
const run = promisify(execFile);

let container: StartedPostgreSqlContainer | undefined;

export default async function setup(project: TestProject) {
  const ownerPassword = randomBytes(18).toString("hex");
  const appPassword = randomBytes(18).toString("hex");
  container = await new PostgreSqlContainer(IMAGE)
    .withDatabase("asclepia")
    .withUsername("asclepia_owner")
    .withPassword(ownerPassword)
    .withCopyFilesToContainer([
      { source: resolve("prisma/sql/roles.sql"), target: "/sql/roles.sql" },
    ])
    .start();

  const owner = container.getConnectionUri();
  await run("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    env: { ...process.env, MIGRATE_DATABASE_URL: owner },
  });
  const roles = await container.exec([
    "psql",
    "-v",
    "ON_ERROR_STOP=1",
    "-U",
    "asclepia_owner",
    "-d",
    "asclepia",
    "-v",
    `app_password=${appPassword}`,
    "-f",
    "/sql/roles.sql",
  ]);
  if (roles.exitCode !== 0) throw new Error(`roles.sql failed: ${roles.stderr}`);

  const app = new URL(owner);
  app.username = "asclepia_app";
  app.password = appPassword;

  // Assert the lane is really low-privilege before any test trusts it.
  const check = await container.exec([
    "psql",
    "-tA",
    "-U",
    "asclepia_owner",
    "-d",
    "asclepia",
    "-c",
    "select rolsuper::text || rolbypassrls::text || rolcreaterole::text from pg_roles where rolname = 'asclepia_app'",
  ]);
  if (check.stdout.trim() !== "falsefalsefalse")
    throw new Error(
      `asclepia_app must be NOSUPERUSER NOBYPASSRLS NOCREATEROLE, got ${check.stdout}`,
    );

  project.provide("appDatabaseUrl", app.toString());
  project.provide("ownerDatabaseUrl", owner);
}

export async function teardown() {
  await container?.stop();
}

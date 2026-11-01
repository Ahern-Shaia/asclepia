import { describe, expect, it } from "vitest";
import { EnvError, parseAuthEnv, parseDbEnv } from "./env";

const db = { DATABASE_URL: "postgresql://asclepia_app:s3cr3t-value@localhost:54329/asclepia" };
const auth = {
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "x".repeat(32),
  GOOGLE_CLIENT_ID: "id",
  GOOGLE_CLIENT_SECRET: "secret",
  ADMIN_EMAILS: " Owner@Example.com , staff@example.com,",
};

const keysOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(EnvError);
    return { keys: (e as EnvError).keys, message: (e as EnvError).message };
  }
  throw new Error("expected EnvError");
};

describe("db env (stack-rules S5-5, P5-2)", () => {
  it("accepts a postgres URL and fills pool defaults", () => {
    expect(parseDbEnv(db)).toMatchObject({ DB_POOL_MAX: 5, DEPLOY_MAX_INSTANCES: 1 });
  });

  it("names the missing key and never echoes values", () => {
    const r = keysOf(() => parseDbEnv({ DATABASE_URL: "mysql://u:s3cr3t-value@h/db" }));
    expect(r.keys).toEqual(["DATABASE_URL"]);
    expect(r.message).not.toContain("s3cr3t-value");
  });

  it("rejects pool × instances + reserved ≥ max connections", () => {
    const r = keysOf(() =>
      parseDbEnv({
        ...db,
        DB_POOL_MAX: "10",
        DEPLOY_MAX_INSTANCES: "10",
        DB_MAX_CONNECTIONS: "100",
      }),
    );
    expect(r.keys).toEqual(["DB_POOL_MAX"]);
  });
});

describe("auth env (stack-rules S4-3, S5-5)", () => {
  it("normalises the admin allowlist", () => {
    expect(parseAuthEnv(auth).ADMIN_EMAILS).toEqual(["owner@example.com", "staff@example.com"]);
  });

  it("rejects a short secret and an empty allowlist, naming only the keys", () => {
    const r = keysOf(() =>
      parseAuthEnv({ ...auth, NEXTAUTH_SECRET: "short-secret-value", ADMIN_EMAILS: " , " }),
    );
    expect(r.keys.sort()).toEqual(["ADMIN_EMAILS", "NEXTAUTH_SECRET"]);
    expect(r.message).not.toContain("short-secret-value");
  });
});

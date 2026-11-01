import "server-only";
import { z } from "zod";

// The only reader of process.env for server secrets (stack-rules S5-5). Parsed per area and lazily,
// so a deployment without a database (the mockup share site) still boots. Errors name the keys only,
// never the values.

export class EnvError extends Error {
  constructor(readonly keys: string[]) {
    super(`Missing or invalid environment variables: ${keys.join(", ")}`);
    this.name = "EnvError";
  }
}

function parse<T extends z.ZodType>(schema: T, source: Record<string, string | undefined>) {
  const r = schema.safeParse(source);
  if (r.success) return r.data as z.infer<T>;
  throw new EnvError([...new Set(r.error.issues.map((i) => String(i.path[0] ?? "(env)")))]);
}

const int = (min: number, def: number) => z.coerce.number().int().min(min).default(def);

export const dbSchema = z
  .object({
    DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\/[^\s]+$/),
    DB_POOL_MAX: int(1, 5),
    DEPLOY_MAX_INSTANCES: int(1, 1),
    DB_RESERVED_CONNECTIONS: int(0, 5), // migrations, psql, monitoring
    DB_MAX_CONNECTIONS: int(1, 100), // Postgres max_connections of the target database
  })
  // stack-rules P5-2: pool × instances + reserved must stay under the server's limit.
  .refine(
    (e) =>
      e.DB_POOL_MAX * e.DEPLOY_MAX_INSTANCES + e.DB_RESERVED_CONNECTIONS < e.DB_MAX_CONNECTIONS,
    { path: ["DB_POOL_MAX"] },
  );

export const authSchema = z.object({
  NEXTAUTH_URL: z.url(),
  NEXTAUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  ADMIN_EMAILS: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean),
    )
    .pipe(z.array(z.email()).min(1)),
});

export const parseDbEnv = (source: Record<string, string | undefined>) => parse(dbSchema, source);
export const parseAuthEnv = (source: Record<string, string | undefined>) =>
  parse(authSchema, source);

export const dbEnv = () => parseDbEnv(process.env);
export const authEnv = () => parseAuthEnv(process.env);

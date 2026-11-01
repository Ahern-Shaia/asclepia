import "server-only";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { audit } from "./audit";
import { authEnv } from "./env";
import { log } from "./log";

// Back-office login (catalog.md A4, OQ-CAT-6): Google accounts on ADMIN_EMAILS only.
export const SESSION_MAX_AGE = 8 * 60 * 60; // user 2026-11-01: one working day (stack-rules S4-3)
export const ADMIN_LOGIN = "/admin/login";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

// stack-rules S4-3: provider is Google, Google says the address is verified, and it is allowlisted.
export function signInAllowed(
  input: { provider?: string; emailVerified?: unknown; email?: string | null },
  allowlist: readonly string[],
) {
  return (
    input.provider === "google" &&
    input.emailVerified === true &&
    !!input.email &&
    allowlist.includes(normalizeEmail(input.email))
  );
}

async function recordSignIn(email: string | null | undefined, allowed: boolean) {
  try {
    await audit({
      actorId: allowed && email ? normalizeEmail(email) : "anonymous",
      action: "auth.signIn",
      targetType: "admin",
      targetId: "back-office",
      result: allowed ? "ok" : "denied",
      // A refused address is someone else's personal data: keep only its domain.
      diff: allowed || !email ? undefined : { domain: email.split("@")[1] ?? "" },
    });
  } catch (e) {
    log("error", "audit.write_failed", { action: "auth.signIn", error: (e as Error).name });
  }
}

let options: NextAuthOptions | undefined;

// Built on first use so deployments without auth env (the mockup share site) still boot.
export function getAuthOptions(): NextAuthOptions {
  if (options) return options;
  const env = authEnv();
  options = {
    secret: env.NEXTAUTH_SECRET,
    providers: [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        authorization: { params: { prompt: "select_account" } },
      }),
    ],
    session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
    jwt: { maxAge: SESSION_MAX_AGE },
    pages: { signIn: ADMIN_LOGIN, error: ADMIN_LOGIN },
    // next-auth's default logger prints full stacks and token errors; keep only the code
    // (stack-rules S6-2). An expired or forged session cookie lands here as JWT_SESSION_ERROR.
    logger: {
      error: (code) => log("warn", "auth.error", { code }),
      warn: (code) => log("warn", "auth.warn", { code }),
      debug: () => {},
    },
    callbacks: {
      async signIn({ account, profile }) {
        const email = profile?.email;
        const allowed = signInAllowed(
          {
            provider: account?.provider,
            emailVerified: (profile as { email_verified?: unknown } | undefined)?.email_verified,
            email,
          },
          env.ADMIN_EMAILS,
        );
        await recordSignIn(email, allowed);
        return allowed;
      },
      async jwt({ token, profile }) {
        if (profile?.email) token.email = normalizeEmail(profile.email);
        return token;
      },
      async session({ session, token }) {
        return { ...session, user: { email: token.email ?? null } };
      },
    },
  };
  return options;
}

export type Admin = { email: string };

// The allowlist is re-checked on every call: a JWT stays valid until it expires, so removing someone
// from ADMIN_EMAILS must take effect without waiting for that (stack-rules S4-3).
export async function getAdmin(): Promise<Admin | null> {
  // Sessions are per request. Without this, cacheComponents tries to prerender the page and
  // next-auth's crypto.randomBytes call aborts it ("unstable value while prerendering").
  await connection();
  const session = await getServerSession(getAuthOptions());
  const email = session?.user?.email;
  if (!email) return null;
  const normalized = normalizeEmail(email);
  return authEnv().ADMIN_EMAILS.includes(normalized) ? { email: normalized } : null;
}

// Every back-office page and route calls this itself; a layout check is not a boundary
// (stack-rules S4-1).
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect(ADMIN_LOGIN);
  return admin;
}

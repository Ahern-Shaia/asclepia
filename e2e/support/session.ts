import type { BrowserContext } from "@playwright/test";
import { encode } from "next-auth/jwt";
import { E2E_AUTH } from "../../playwright.config";

// A next-auth session cookie signed with the e2e secret: the same thing Google sign-in produces,
// without Google. `maxAge` in seconds; a negative value yields an already-expired session.
export async function signInAs(context: BrowserContext, email: string, maxAge = 3600) {
  const now = Math.floor(Date.now() / 1000);
  const value = await encode({
    secret: E2E_AUTH.secret,
    token: { email, sub: email, iat: now, exp: now + maxAge },
    maxAge,
  });
  await context.addCookies([
    { name: "next-auth.session-token", value, domain: "localhost", path: "/", httpOnly: true },
  ]);
}

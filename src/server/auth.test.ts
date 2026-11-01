import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => getServerSession(...a) }));
vi.mock("next-auth/providers/google", () => ({ default: (o: object) => ({ id: "google", ...o }) }));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));
vi.mock("./audit", () => ({ audit: vi.fn() }));
vi.mock("next/server", () => ({ connection: async () => undefined }));

const { getAdmin, requireAdmin, signInAllowed } = await import("./auth");

const list = ["owner@example.com"];

describe("signIn allowlist (stack-rules S4-3)", () => {
  const ok = { provider: "google", emailVerified: true, email: "owner@example.com" };
  it("allows a verified, allowlisted Google account", () => {
    expect(signInAllowed(ok, list)).toBe(true);
  });
  it("normalises case and spaces", () => {
    expect(signInAllowed({ ...ok, email: "  Owner@Example.COM " }, list)).toBe(true);
  });
  it("refuses an unverified address", () => {
    expect(signInAllowed({ ...ok, emailVerified: false }, list)).toBe(false);
    expect(signInAllowed({ ...ok, emailVerified: "true" }, list)).toBe(false);
  });
  it("refuses an address not on the list", () => {
    expect(signInAllowed({ ...ok, email: "someone@example.com" }, list)).toBe(false);
  });
  it("refuses any other provider", () => {
    expect(signInAllowed({ ...ok, provider: "github" }, list)).toBe(false);
  });
});

describe("getAdmin re-checks the allowlist on every call", () => {
  beforeEach(() => {
    vi.stubEnv("NEXTAUTH_URL", "http://localhost:3000");
    vi.stubEnv("NEXTAUTH_SECRET", "x".repeat(32));
    vi.stubEnv("GOOGLE_CLIENT_ID", "id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "secret");
    vi.stubEnv("ADMIN_EMAILS", "owner@example.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    getServerSession.mockReset();
  });

  it("returns the admin for an allowlisted session", async () => {
    getServerSession.mockResolvedValue({ user: { email: "Owner@example.com" } });
    expect(await getAdmin()).toEqual({ email: "owner@example.com" });
  });

  it("drops a still-valid session once the address leaves the list", async () => {
    getServerSession.mockResolvedValue({ user: { email: "owner@example.com" } });
    vi.stubEnv("ADMIN_EMAILS", "other@example.com");
    expect(await getAdmin()).toBeNull();
    await expect(requireAdmin()).rejects.toThrow("redirect:/admin/login");
  });

  it("treats no session as signed out", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("redirect:/admin/login");
  });
});

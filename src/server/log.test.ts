import { describe, expect, it } from "vitest";
import { redactForTest } from "./log";

describe("log redaction (stack-rules S6-2)", () => {
  it("removes personal fields at any depth and keeps the rest", () => {
    const out = redactForTest({
      itemCount: 2,
      inquiry: { name: "陳小姐", phone: "0912", email: "a@b.c", items: [{ productId: "p1" }] },
      headers: { Authorization: "Bearer x", cookie: "s=1" },
    });
    expect(out).toEqual({
      itemCount: 2,
      inquiry: {
        name: "[redacted]",
        phone: "[redacted]",
        email: "[redacted]",
        items: [{ productId: "p1" }],
      },
      headers: { Authorization: "[redacted]", cookie: "[redacted]" },
    });
  });
});

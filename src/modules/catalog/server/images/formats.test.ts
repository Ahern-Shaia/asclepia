import { describe, expect, it } from "vitest";
import { sniffFormat } from "./formats";

const bytes = (...xs: (number | string)[]) =>
  new Uint8Array(
    xs.flatMap((x) => (typeof x === "string" ? [...x].map((c) => c.charCodeAt(0)) : [x])),
  );

describe("sniffFormat (catalog.md §4.2)", () => {
  it("recognises JPEG, PNG and WebP by their first bytes", () => {
    expect(sniffFormat(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("jpeg");
    expect(sniffFormat(bytes(0x89, "PNG", 0x0d, 0x0a, 0x1a, 0x0a))).toBe("png");
    expect(sniffFormat(bytes("RIFF", 0, 0, 0, 0, "WEBP"))).toBe("webp");
  });
  it("refuses SVG, HEIC, GIF and anything short", () => {
    expect(sniffFormat(bytes("<svg xmlns='http://www.w3.org/2000/svg'>"))).toBeNull();
    expect(sniffFormat(bytes(0, 0, 0, 0x18, "ftypheic"))).toBeNull();
    expect(sniffFormat(bytes("GIF89a"))).toBeNull();
    expect(sniffFormat(bytes(0xff, 0xd8))).toBeNull();
  });
});

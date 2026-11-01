import "server-only";

// Decide the format from the first bytes, never from the file name or Content-Type. Only these three
// reach sharp; SVG (script-capable XML) and HEIC are refused before any parser sees them (S2-3).
export type ImageFormat = "jpeg" | "png" | "webp";

export function sniffFormat(b: Uint8Array): ImageFormat | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((x, i) => b[i] === x))
    return "png";
  if (
    b.length >= 12 &&
    String.fromCharCode(...b.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...b.subarray(8, 12)) === "WEBP"
  )
    return "webp";
  return null;
}

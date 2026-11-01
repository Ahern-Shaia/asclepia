import { FILE, readMedia } from "@/modules/catalog/server/images/storage";

// Serves re-encoded product images (development storage). Names are random and immutable, so they
// cache forever. nosniff + a sandboxing CSP keep a file from ever running as a page
// (security-baseline §0 #2; production will serve from a separate domain, CLAUDE.md §2.4).
export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!FILE.test(file)) return new Response(null, { status: 404 });
  const data = await readMedia(file);
  if (!data) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}

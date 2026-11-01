import "server-only";
import { type Admin, getAdmin } from "./auth";
import { fail, toFailure } from "./errors";

// Route Handler twin of adminAction, for the few back-office endpoints that can't be Server Actions
// (uploads: stack-rules S8-3). Same contract: 401 when signed out, translated errors only.
export function adminRoute<C>(
  name: string,
  run: (req: Request, ctx: C, admin: Admin) => Promise<unknown>,
) {
  return async (req: Request, ctx: C): Promise<Response> => {
    const admin = await getAdmin();
    if (!admin) return Response.json(fail("UNAUTHORIZED"), { status: 401 });
    try {
      return Response.json({ ok: true, data: await run(req, ctx, admin) });
    } catch (e) {
      const f = toFailure(e, name);
      return Response.json(f, { status: f.code === "UNKNOWN" ? 500 : 400 });
    }
  };
}

// Reads a request body without ever holding more than `max` bytes (stack-rules P6-1): the declared
// length is checked first, then the stream is counted as it arrives.
export async function readCapped(
  req: Request,
  max: number,
  onTooLarge: () => Error,
): Promise<Buffer> {
  const declared = Number(req.headers.get("content-length") ?? "NaN");
  if (Number.isFinite(declared) && declared > max) throw onTooLarge();
  if (!req.body) return Buffer.alloc(0);
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > max) {
      await reader.cancel();
      throw onTooLarge();
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

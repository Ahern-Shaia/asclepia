import { z } from "zod";
import { publicCardsByIds, publicConfigs } from "@/modules/catalog/server/public/catalog";
import { INQUIRY_MAX } from "@/modules/inquiry";
import { fail, toFailure } from "@/server/errors";
import { productId } from "../../../_params";

// Current state of the items in a visitor's inquiry list (ids come from their browser, so they
// are validated and capped). Drafts and hidden items don't come back; sold ones come back flagged.
const query = z.object({
  ids: z
    .string()
    .max(INQUIRY_MAX * 41)
    .transform((s) => [...new Set(s.split(",").filter(Boolean))])
    .pipe(z.array(productId).min(1).max(INQUIRY_MAX)),
});

const headers = { "Cache-Control": "no-store" };

export async function GET(req: Request) {
  const parsed = query.safeParse(Object.fromEntries(new URL(req.url).searchParams));
  if (!parsed.success) return Response.json(fail("INVALID"), { status: 400, headers });
  try {
    const [items, configs] = await Promise.all([
      publicCardsByIds(parsed.data.ids),
      publicConfigs(),
    ]);
    const used = new Set(items.map((p) => p.categoryId));
    return Response.json(
      {
        ok: true,
        data: {
          items,
          configs: Object.fromEntries(Object.entries(configs).filter(([id]) => used.has(id))),
        },
      },
      { headers },
    );
  } catch (e) {
    return Response.json(toFailure(e, "inquiry.items"), { status: 500, headers });
  }
}

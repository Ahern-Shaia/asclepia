import { revalidateTag } from "next/cache";
import { z } from "zod";
import { setCategoryIconImage } from "@/modules/catalog/server/categories";
import { DomainError } from "@/server/errors";
import { MAX_UPLOAD_BYTES } from "@/server/images/process";
import { adminRoute, readCapped } from "@/server/route";

const params = z.object({ id: z.string().min(1).max(40) });

// POST the raw bytes of a category icon (one image per request, like product photos). updateTag is
// Server-Action-only, so the public catalog cache is expired here with { expire: 0 }.
export const POST = adminRoute(
  "category.icon.upload",
  async (req, ctx: { params: Promise<{ id: string }> }, admin) => {
    const p = params.safeParse(await ctx.params);
    if (!p.success) throw new DomainError("NOT_FOUND");
    const body = await readCapped(req, MAX_UPLOAD_BYTES, () => new DomainError("IMAGE_TOO_LARGE"));
    const r = await setCategoryIconImage(p.data.id, body, admin.email);
    revalidateTag("catalog", { expire: 0 });
    return r;
  },
);

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { addImage } from "@/modules/catalog/server/images";
import { MAX_UPLOAD_BYTES } from "@/server/images/process";
import { DomainError } from "@/server/errors";
import { adminRoute, readCapped } from "@/server/route";

const params = z.object({ id: z.string().min(1).max(40) });

// POST the raw image bytes (one image per request, stack-rules P4-2). Not a Server Action: the
// action body limit is global and stays at 1 MB (S8-3). Auth via adminRoute → getAdmin, the same
// check requireAdmin() makes.
export const POST = adminRoute(
  "product.image.add",
  async (req, ctx: { params: Promise<{ id: string }> }, admin) => {
    const p = params.safeParse(await ctx.params);
    if (!p.success) throw new DomainError("NOT_FOUND");
    const body = await readCapped(req, MAX_UPLOAD_BYTES, () => new DomainError("IMAGE_TOO_LARGE"));
    const image = await addImage(p.data.id, body, admin.email);
    // updateTag is Server-Action-only; without this a published product kept its old photo set on
    // the public pages until the cache expired (found 2026-11-01, e2e "a photo added to a published product …")
    revalidateTag("catalog", { expire: 0 });
    revalidateTag(`product:${p.data.id}`, { expire: 0 });
    return image;
  },
);

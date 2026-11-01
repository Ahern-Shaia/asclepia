import { revalidateTag } from "next/cache";
import { siteImageKindSchema } from "@/modules/site-config/images";
import { setSiteImage } from "@/modules/site-config/server/images";
import { DomainError } from "@/server/errors";
import { MAX_UPLOAD_BYTES } from "@/server/images/process";
import { adminRoute, readCapped } from "@/server/route";

// POST the raw image bytes for the store logo or hero photo (/admin/settings/images/logo|hero).
// A Route Handler like product photos (S8-3: the Server Action body limit stays 1 MB). updateTag
// is Server-Action-only, so the public settings cache is expired here with { expire: 0 }: the next
// request reads the new image (next docs: revalidateTag "Route Handler").
export const POST = adminRoute(
  "site-config.image.set",
  async (req, ctx: { params: Promise<{ kind: string }> }, admin) => {
    const kind = siteImageKindSchema.safeParse((await ctx.params).kind.toUpperCase());
    if (!kind.success) throw new DomainError("NOT_FOUND");
    const body = await readCapped(req, MAX_UPLOAD_BYTES, () => new DomainError("IMAGE_TOO_LARGE"));
    const r = await setSiteImage(kind.data, body, admin.email);
    revalidateTag("site-config", { expire: 0 });
    return r;
  },
);

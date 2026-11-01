import { revalidateTag } from "next/cache";
import { brandNameSchema, siteImageKindSchema } from "@/modules/site-config/images";
import { setBrandLogo, setSiteImage } from "@/modules/site-config/server/images";
import { DomainError } from "@/server/errors";
import { MAX_UPLOAD_BYTES } from "@/server/images/process";
import { adminRoute, readCapped } from "@/server/route";

// POST the raw image bytes for a store image: /admin/settings/images/logo|hero|visit|favicon, or
// /admin/settings/images/brand?name=<brand> for a brand logo. A Route Handler like product photos
// (S8-3: the Server Action body limit stays 1 MB). updateTag is Server-Action-only, so the public
// settings cache is expired here with { expire: 0 }: the next request reads the new image.
export const POST = adminRoute(
  "site-config.image.set",
  async (req, ctx: { params: Promise<{ kind: string }> }, admin) => {
    const kind = (await ctx.params).kind;
    const read = () => readCapped(req, MAX_UPLOAD_BYTES, () => new DomainError("IMAGE_TOO_LARGE"));
    let result: unknown;
    if (kind === "brand") {
      const brand = brandNameSchema.safeParse(new URL(req.url).searchParams.get("name") ?? "");
      if (!brand.success) throw new DomainError("NOT_FOUND");
      result = await setBrandLogo(brand.data, await read(), admin.email);
    } else {
      const k = siteImageKindSchema.safeParse(kind.toUpperCase());
      if (!k.success) throw new DomainError("NOT_FOUND");
      result = await setSiteImage(k.data, await read(), admin.email);
    }
    revalidateTag("site-config", { expire: 0 });
    return result;
  },
);

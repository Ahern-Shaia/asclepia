import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { createCategory, newDraft, saveNewDraft, signIn, uid } from "./support/admin";

// M2 image pipeline through the real UI (catalog.md §4.2).
const photo = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 3, background: { r: 40, g: 90, b: 160 } } })
    .withExif({ IFD3: { GPSLatitudeRef: "N", GPSLatitude: "25/1 2/1 0/1" } })
    .jpeg()
    .toBuffer();

test("upload photos, refuse an SVG, choose the main photo, then publish", async ({
  page,
  context,
}) => {
  await signIn(context);
  const id = uid();
  const category = `e2e-照片${id}`;
  await createCategory(page, category);
  await newDraft(page, category, `e2e-照片商品${id}`);
  await saveNewDraft(page);

  // only the 「選擇照片」 button shows; antd's form CSS once made the native picker visible too
  await expect(page.locator('input[type="file"]')).toBeHidden();
  await page.locator('input[type="file"]').setInputFiles([
    { name: "front.jpg", mimeType: "image/jpeg", buffer: await photo(1200, 900) },
    {
      name: "logo.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"),
    },
    { name: "panel.jpg", mimeType: "image/jpeg", buffer: await photo(900, 1200) },
  ]);
  await expect(page.getByRole("img", { name: "商品照片 2" })).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "logo.svg：只接受 JPG、PNG、WebP" }),
  ).toBeVisible();
  await expect(page.getByText("2 / 20 張")).toBeVisible();

  const first = await page.getByRole("img", { name: "商品照片 1" }).getAttribute("src");
  // the list updates at once (optimistic); wait for the server's answer before reloading
  const saved = page.waitForResponse(
    (r) => r.request().method() === "POST" && r.url().includes("/admin/products/"),
  );
  await page.getByRole("button", { name: "設為主圖" }).click();
  await expect(page.getByRole("img", { name: "商品照片 1" })).not.toHaveAttribute("src", first!);
  await saved;
  await page.reload(); // the new order is stored, not just shown
  await expect(page.getByRole("img", { name: "商品照片 2" })).toHaveAttribute("src", first!);

  // the re-encoded file is WebP, served so it can't run as a page
  const res = await page.request.get(first!);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/webp");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect((await res.body()).includes(Buffer.from("Exif"))).toBe(false);

  await page.getByRole("button", { name: /^上\s?架$/ }).click();
  const status = page.getByText("目前狀態").filter({ visible: true }).locator("..");
  await expect(status).toContainText("上架中");
});

test("uploading without a session is refused", async ({ request }) => {
  const res = await request.post("/admin/products/anything/images", {
    headers: { "Content-Type": "image/jpeg" },
    data: await photo(10, 10),
  });
  expect(res.status()).toBe(401);
  expect((await res.json()).code).toBe("UNAUTHORIZED");
});

test("media names outside the generated pattern are 404", async ({ request }) => {
  for (const name of [
    "..%2F.env",
    "img_x-400.webp",
    "img_00000000000000000000000000000000-999.webp",
  ])
    expect((await request.get(`/media/${name}`)).status()).toBe(404);
});

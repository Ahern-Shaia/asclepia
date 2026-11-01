import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth";

export default async function Page() {
  await requireAdmin();
  redirect("/admin/products");
}

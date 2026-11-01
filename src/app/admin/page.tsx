import { redirect } from "next/navigation";
import { requireAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell; it blocks on the
// server by design (next docs: authentication-with-cache-components; `use cache: private` is
// banned by stack-rules P7-1).
export const instant = false;

export default async function Page() {
  await requireAdmin();
  redirect("/admin/products");
}

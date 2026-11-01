import { redirect } from "next/navigation";
import { LoginView } from "@/components/admin/login-view";
import { getAdmin } from "@/server/auth";

// Every back-office page reads the session, which can't be in the static shell; it blocks on the
// server by design (next docs: authentication-with-cache-components; `use cache: private` is
// banned by stack-rules P7-1).
export const instant = false;

// The one back-office page that does not call requireAdmin(): it is where requireAdmin() sends you.
export default async function Page({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return <LoginView denied={error === "AccessDenied"} />;
}

import { redirect } from "next/navigation";
import { LoginView } from "@/components/admin/login-view";
import { getAdmin } from "@/server/auth";

// The one back-office page that does not call requireAdmin(): it is where requireAdmin() sends you.
export default async function Page({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return <LoginView denied={error === "AccessDenied"} />;
}

import { LoginView } from "@/components/admin/login-view";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { denied } = await searchParams;
  return <LoginView denied={denied === "1"} mock />;
}

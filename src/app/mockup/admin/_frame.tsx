import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { inquiries } from "../_data";
import { ADMIN } from "../_adapters";

export function AdminFrame({
  active,
  children,
}: {
  active: "products" | "inquiries";
  children: ReactNode;
}) {
  return (
    <AdminShell
      base={ADMIN}
      active={active}
      newInquiries={inquiries.filter((q) => q.status === "NEW").length}
      user="staff@example.com"
      mock
    >
      {children}
    </AdminShell>
  );
}

import type { ReactNode } from "react";
import { type AdminSection, AdminShell } from "@/components/admin/admin-shell";
import { inquiries } from "../_data";
import { ADMIN } from "../_adapters";

export function AdminFrame({ active, children }: { active: AdminSection; children: ReactNode }) {
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

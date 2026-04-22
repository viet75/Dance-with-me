import { AdminLayout as AdminShell } from "@/components/admin/AdminLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

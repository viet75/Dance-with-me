import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Container } from "@/components/shared/Container";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <section className="py-6 md:py-8">
      <Container className="min-w-0">
        <div className="grid min-w-0 gap-4 md:gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <AdminSidebar />
          <div className="min-w-0 w-full rounded-2xl border border-border bg-white p-4 sm:p-5 md:p-6">{children}</div>
        </div>
      </Container>
    </section>
  );
}

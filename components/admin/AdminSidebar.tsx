"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/browser";
import { adminNavItems } from "@/lib/utils/navigation";
import { cn } from "@/lib/utils/cn";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  return (
    <aside className="min-w-0 w-full rounded-2xl border border-border bg-white p-4 lg:sticky lg:top-20 lg:w-64 lg:self-start">
      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Admin</p>
      <nav className="flex flex-1 flex-col gap-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-10 items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-primary-soft hover:text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 w-full rounded-md border border-border px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 lg:mt-auto"
      >
        Logout
      </button>
    </aside>
  );
}

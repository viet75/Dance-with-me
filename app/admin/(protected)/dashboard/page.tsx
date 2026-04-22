"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/shared/Card";
import { supabase } from "@/lib/supabase/client";

type DashboardItem = {
  href: string;
  label: string;
  table: string | null;
  count: number | null;
};

const initialItems: DashboardItem[] = [
  { href: "/admin/corsi", label: "Corsi", table: "courses", count: null },
  { href: "/admin/orari", label: "Orari", table: "schedules", count: null },
  { href: "/admin/news", label: "News", table: "news", count: null },
  { href: "/admin/video", label: "Video", table: "videos", count: null },
  { href: "/admin/galleria", label: "Galleria", table: "gallery_images", count: null },
  { href: "/admin/chi-siamo", label: "Chi siamo", table: "about_content", count: null },
  { href: "/admin/impostazioni", label: "Impostazioni", table: "site_settings", count: null },
];

export default function AdminDashboardPage() {
  const [items, setItems] = useState<DashboardItem[]>(initialItems);

  useEffect(() => {
    const fetchCounts = async () => {
      const countPromises = initialItems.map(async (item) => {
        if (!item.table) {
          return item;
        }

        const { count } = await supabase.from(item.table).select("*", { count: "exact", head: true });
        return { ...item, count: count ?? 0 };
      });

      const nextItems = await Promise.all(countPromises);
      setItems(nextItems);
    };

    void fetchCounts();
  }, []);

  return (
    <section>
      <h1 className="text-3xl font-semibold text-gray-900">Dashboard amministrazione</h1>
      <p className="mt-2 text-sm text-gray-600">Accedi rapidamente alle sezioni principali del pannello admin.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Card key={item.href}>
            <h2 className="text-lg font-semibold text-gray-900">{item.label}</h2>
            <p className="mt-1 text-sm text-gray-600">
              {item.count === null ? "Caricamento..." : `${item.count} elementi`}
            </p>
            <Link href={item.href} className="mt-3 inline-block text-sm font-semibold text-primary">
              Apri sezione →
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

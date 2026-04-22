import Link from "next/link";

import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";

const links = [
  { href: "/corsi", label: "Corsi" },
  { href: "/orari", label: "Orari" },
  { href: "/news", label: "News" },
  { href: "/contatti", label: "Contatti" },
];

export function QuickLinksSection() {
  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container>
        <SectionTitle title="Accesso rapido" description="Tutte le informazioni principali a portata di tap." />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 min-w-0 items-center justify-center rounded-xl border border-border bg-white px-3 py-4 text-center text-xs font-semibold text-gray-800 hover:border-primary hover:text-primary sm:min-h-0 sm:px-4 sm:py-5 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

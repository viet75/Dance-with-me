import Link from "next/link";

import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";

const links = [
  { href: "/contatti", label: "Prova", subtitle: "Lezione gratuita" },
  { href: "/orari", label: "Orari", subtitle: "Settimana attiva" },
  { href: "/news", label: "News", subtitle: "Ultimi aggiornamenti" },
  { href: "/contatti", label: "Contatti", subtitle: "Siamo qui" },
];

export function QuickLinksSection() {
  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container>
        <SectionTitle title="Accesso rapido" description="Tutte le informazioni principali a portata di tap." />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {links.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="flex min-h-11 min-w-0 flex-col items-start justify-center rounded-3xl border border-white/50 bg-gradient-to-br from-white via-purple-50/40 to-white px-4 py-5 text-left shadow-[0_10px_30px_rgba(88,28,135,0.06)] transition-all duration-200 ease-out hover:shadow-[0_14px_34px_rgba(88,28,135,0.12)] active:scale-[0.98] sm:min-h-0"
            >
              <span className="text-sm font-semibold text-purple-500">✦</span>
              <span className="text-base font-semibold tracking-tight text-gray-900">{item.label}</span>
              <span className="text-xs text-gray-500">{item.subtitle}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

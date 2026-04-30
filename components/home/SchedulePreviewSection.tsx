import { Button } from "@/components/shared/Button";
import { Card } from "@/components/shared/Card";
import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";

export function SchedulePreviewSection() {
  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container>
        <SectionTitle
          title="Orari lezioni"
          description="Una panoramica rapida delle attività della settimana."
        />
        <div className="mt-8 space-y-7">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
            <Card className="min-w-0 rounded-[2rem] border border-white/50 bg-gradient-to-br from-white via-purple-50/30 to-white p-4 shadow-[0_10px_30px_rgba(88,28,135,0.06)] transition-all duration-300 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">Sessione</span>
              <h3 className="text-lg font-semibold text-gray-900">Mattina</h3>
              <p className="mt-2 text-sm font-semibold tracking-tight text-purple-600">9:00 – 10:00</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">Zumba e Pilates</p>
            </Card>
            <Card className="min-w-0 rounded-[2rem] border border-white/50 bg-gradient-to-br from-white via-purple-50/30 to-white p-4 shadow-[0_10px_30px_rgba(88,28,135,0.06)] transition-all duration-300 sm:p-5">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">Sessione</span>
              <h3 className="text-lg font-semibold text-gray-900">Pomeriggio</h3>
              <p className="mt-2 text-sm font-semibold tracking-tight text-purple-600">16:30 – 21:30</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">Corsi bambini, ragazzi e adulti</p>
            </Card>
          </div>
          <div className="flex justify-center pt-3">
            <Button
              href="/orari"
              variant="secondary"
              className="inline-flex items-center gap-2 rounded-full px-6 shadow-[0_8px_24px_rgba(88,28,135,0.10)] transition-all duration-200 ease-out active:scale-[0.97]"
            >
              Vedi tutti gli orari <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

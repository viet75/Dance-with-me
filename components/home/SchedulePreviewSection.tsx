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
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-stretch">
            <Card className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="text-lg font-semibold text-gray-900">Mattina</h3>
              <p className="mt-2 text-sm font-medium text-purple-600">9:00 – 10:00</p>
              <p className="mt-2 text-sm text-gray-600">Zumba e Pilates</p>
            </Card>
            <Card className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="text-lg font-semibold text-gray-900">Pomeriggio</h3>
              <p className="mt-2 text-sm font-medium text-purple-600">16:30 – 21:30</p>
              <p className="mt-2 text-sm text-gray-600">Corsi bambini, ragazzi e adulti</p>
            </Card>
          </div>
          <div className="flex justify-center pt-1">
            <Button href="/orari" variant="secondary">
              Vedi tutti gli orari
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

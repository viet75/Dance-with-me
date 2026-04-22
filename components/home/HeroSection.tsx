import { Button } from "@/components/shared/Button";
import { Container } from "@/components/shared/Container";

export function HeroSection() {
  return (
    <section className="min-w-0 border-b border-border bg-gradient-to-b from-primary-soft to-background">
      <Container className="py-12 sm:py-16 md:py-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm">
          Scuola di danza a misura di persona
        </p>
        <h1 className="mt-3 max-w-3xl text-balance break-words text-3xl font-semibold tracking-tight text-gray-900 sm:mt-4 sm:text-4xl md:text-5xl">
          Impara a ballare con stile, energia e passione.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-gray-600 sm:mt-5 sm:text-base">
          Dance With Me e la scuola ideale per chi vuole iniziare o perfezionarsi in danza classica, contemporanea, modern jazz, video dance e hip hop con un metodo
          moderno e coinvolgente.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button href="/corsi">Scopri i corsi</Button>
          <Button href="/contatti" variant="secondary">
            Prenota una prova
          </Button>
        </div>
      </Container>
    </section>
  );
}

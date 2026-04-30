import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { getFeaturedGalleryImages } from "@/lib/supabase/gallery";

export async function GalleryPreview() {
  const { data: previewImages, error } = await getFeaturedGalleryImages(6);

  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container>
        <SectionTitle
          title="Galleria"
          description="Uno sguardo alle lezioni, ai workshop e ai momenti piu belli vissuti in sala."
        />
        {error ? (
          <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            {error}
          </p>
        ) : previewImages.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessuna immagine disponibile al momento.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
            {previewImages.map((image) => (
              <Link
                key={image.id}
                href="/galleria"
                aria-label="Apri galleria completa"
                className="block min-w-0 overflow-hidden rounded-2xl border border-border bg-white cursor-pointer transition-all duration-200 ease-out active:scale-[0.98] md:hover:scale-[1.01]"
              >
                <img
                  src={image.image_url}
                  alt={image.title || "Immagine galleria"}
                  loading="lazy"
                  className="aspect-square h-full w-full max-w-full object-cover transition-transform duration-300 md:hover:scale-105"
                />
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Button href="/galleria" className="transition-all duration-200 ease-out active:scale-[0.97]">
            Vai alla galleria completa
          </Button>
        </div>
      </Container>
    </section>
  );
}

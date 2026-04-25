import type { Metadata } from "next";

import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { getActiveGalleryImages } from "@/lib/supabase/gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galleria | Dance With Me",
  description: "Scopri foto di lezioni, workshop e performance della scuola Dance With Me.",
};

export default async function GalleriaPage() {
  const { data: images, error } = await getActiveGalleryImages();

  return (
    <>
      <PagePlaceholder
        title="Galleria"
        description="Una raccolta di momenti dalla sala: lezioni, prove, eventi e serate social."
      />
      <Container className="pb-14">
        {error ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            {error}
          </p>
        ) : images.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessuna immagine disponibile al momento.
          </p>
        ) : (
          <GalleryGrid images={images} />
        )}
      </Container>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

import type { GalleryImageView } from "@/lib/supabase/gallery";

const FALLBACK_IMAGE_SRC = "/file.svg";

type GalleryGridProps = {
  images: GalleryImageView[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImageView | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="group overflow-hidden rounded-2xl border border-border bg-white"
            aria-label={`Apri immagine: ${image.title || "Immagine galleria"}`}
          >
            <img
              src={image.image_url}
              alt={image.title || "Immagine galleria"}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE_SRC;
              }}
              className="aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Anteprima immagine galleria"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white"
            >
              Chiudi
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || "Immagine galleria"}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE_SRC;
              }}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

import type { GalleryImageView } from "@/lib/supabase/gallery";

const FALLBACK_IMAGE_SRC = "/file.svg";

type GalleryGridProps = {
  images: GalleryImageView[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;

  const showPreviousImage = () => {
    setSelectedImageIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    });
  };

  const showNextImage = () => {
    setSelectedImageIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    });
  };

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImageIndex(null);
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedImageIndex(index)}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 touch-auto"
          data-allow-zoom="true"
          style={{ touchAction: "auto" }}
          role="dialog"
          aria-modal="true"
          aria-label="Anteprima immagine galleria"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div
            className="relative w-full max-w-4xl overflow-auto touch-auto"
            data-allow-zoom="true"
            style={{ touchAction: "pan-x pan-y pinch-zoom" }}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              setTouchStartX(event.changedTouches[0].clientX);
            }}
            onTouchEnd={(event) => {
              if (touchStartX === null) return;

              const touchEndX = event.changedTouches[0].clientX;
              const difference = touchStartX - touchEndX;

              if (difference > 50) {
                showNextImage();
              } else if (difference < -50) {
                showPreviousImage();
              }

              setTouchStartX(null);
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedImageIndex(null)}
              className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white"
            >
              Chiudi
            </button>
            <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-white">
              {selectedImageIndex !== null ? `${selectedImageIndex + 1} / ${images.length}` : ""}
            </div>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl font-bold text-white"
              aria-label="Immagine precedente"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/70 text-2xl font-bold text-white"
              aria-label="Immagine successiva"
            >
              ›
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || "Immagine galleria"}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE_SRC;
              }}
              className="max-h-[80vh] w-full rounded-2xl object-contain touch-auto select-none"
              style={{ touchAction: "pan-x pan-y pinch-zoom" }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

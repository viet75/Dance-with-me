"use client";

import { useEffect, useRef, useState } from "react";

import type { GalleryImageView } from "@/lib/supabase/gallery";

const FALLBACK_IMAGE_SRC = "/file.svg";

type GalleryGridProps = {
  images: GalleryImageView[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastTap, setLastTap] = useState<{ time: number; x: number; y: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;
  const canPan = zoomLevel > 1;

  const clampPanPosition = (nextX: number, nextY: number) => {
    const viewportRect = viewportRef.current?.getBoundingClientRect();
    const imageRect = imageRef.current?.getBoundingClientRect();

    if (!viewportRect || !imageRect) {
      return { x: nextX, y: nextY };
    }

    const baseWidth = imageRect.width / zoomLevel;
    const baseHeight = imageRect.height / zoomLevel;
    const scaledWidth = baseWidth * zoomLevel;
    const scaledHeight = baseHeight * zoomLevel;

    const maxX = Math.max(0, (scaledWidth - viewportRect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - viewportRect.height) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, nextX)),
      y: Math.min(maxY, Math.max(-maxY, nextY)),
    };
  };

  const resetZoomAndPan = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsPanning(false);
    setPanStart({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    resetZoomAndPan();
    setSelectedImageIndex(null);
  };

  const showPreviousImage = () => {
    resetZoomAndPan();
    setSelectedImageIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    });
  };

  const showNextImage = () => {
    resetZoomAndPan();
    setSelectedImageIndex((currentIndex) => {
      if (currentIndex === null) return null;
      return currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    });
  };

  const increaseZoom = () => {
    setZoomLevel((currentZoom) => Math.min(3, Number((currentZoom + 0.5).toFixed(2))));
  };

  const decreaseZoom = () => {
    setZoomLevel((currentZoom) => {
      const nextZoom = Math.max(1, Number((currentZoom - 0.5).toFixed(2)));
      if (nextZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return nextZoom;
    });
  };

  const toggleZoom = () => {
    setZoomLevel((currentZoom) => {
      if (currentZoom === 1) {
        return 2;
      }

      setPanPosition({ x: 0, y: 0 });
      return 1;
    });
  };

  useEffect(() => {
    if (zoomLevel === 1) {
      setPanPosition({ x: 0, y: 0 });
      setIsPanning(false);
      return;
    }

    setPanPosition((currentPosition) => clampPanPosition(currentPosition.x, currentPosition.y));
  }, [zoomLevel]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }

      if (event.key === "+" || event.key === "=") {
        increaseZoom();
      }

      if (event.key === "-") {
        decreaseZoom();
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 touch-auto"
          style={{ touchAction: "none" }}
          role="dialog"
          aria-modal="true"
          aria-label="Anteprima immagine galleria"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden touch-auto"
            style={{ touchAction: canPan ? "none" : "pan-x pan-y" }}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              const touch = event.changedTouches[0];
              const now = Date.now();

              if (lastTap && now - lastTap.time < 280) {
                const deltaX = Math.abs(lastTap.x - touch.clientX);
                const deltaY = Math.abs(lastTap.y - touch.clientY);

                if (deltaX < 24 && deltaY < 24) {
                  toggleZoom();
                  setLastTap(null);
                }
              } else {
                setLastTap({ time: now, x: touch.clientX, y: touch.clientY });
              }

              setTouchStartX(event.changedTouches[0].clientX);

              if (canPan) {
                setIsPanning(true);
                setPanStart({
                  x: touch.clientX - panPosition.x,
                  y: touch.clientY - panPosition.y,
                });
              }
            }}
            onTouchMove={(event) => {
              if (!canPan || !isPanning) return;

              const touch = event.changedTouches[0];
              setPanPosition(clampPanPosition(touch.clientX - panStart.x, touch.clientY - panStart.y));
            }}
            onTouchEnd={(event) => {
              setIsPanning(false);

              if (touchStartX === null) return;

              const touchEndX = event.changedTouches[0].clientX;
              const difference = touchStartX - touchEndX;

              if (!canPan && difference > 50) {
                showNextImage();
              } else if (!canPan && difference < -50) {
                showPreviousImage();
              }

              setTouchStartX(null);
            }}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Chiudi anteprima"
            >
              Chiudi
            </button>
            <div className="absolute left-3 top-3 z-20 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
              {selectedImageIndex !== null ? `${selectedImageIndex + 1} / ${images.length}` : ""}
            </div>
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              <button
                type="button"
                onClick={decreaseZoom}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-semibold text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Riduci zoom"
              >
                −
              </button>
              <span className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
                {zoomLevel.toFixed(1)}x
              </span>
              <button
                type="button"
                onClick={increaseZoom}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl font-semibold text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Aumenta zoom"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Immagine precedente"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Immagine successiva"
            >
              ›
            </button>
            <div ref={viewportRef} className="flex min-h-[70vh] w-full items-center justify-center overflow-hidden rounded-2xl">
              <img
                ref={imageRef}
                src={selectedImage.image_url}
                alt={selectedImage.title || "Immagine galleria"}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE_SRC;
                }}
                onDoubleClick={toggleZoom}
                onMouseDown={(event) => {
                  if (!canPan) return;
                  setIsPanning(true);
                  setPanStart({
                    x: event.clientX - panPosition.x,
                    y: event.clientY - panPosition.y,
                  });
                }}
                onMouseMove={(event) => {
                  if (!canPan || !isPanning) return;
                  setPanPosition(clampPanPosition(event.clientX - panStart.x, event.clientY - panStart.y));
                }}
                onMouseUp={() => setIsPanning(false)}
                onMouseLeave={() => setIsPanning(false)}
                className="max-h-[85vh] w-full rounded-2xl object-contain select-none"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                  transition: isPanning ? "none" : "transform 200ms ease-out",
                  cursor: canPan ? (isPanning ? "grabbing" : "grab") : "zoom-in",
                  touchAction: canPan ? "none" : "pan-x pan-y",
                }}
                draggable={false}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

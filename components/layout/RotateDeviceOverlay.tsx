"use client";

import { useEffect, useState } from "react";

export function RotateDeviceOverlay() {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      setShowOverlay(false);
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1024px) and (orientation: landscape)");
    const updateVisibility = () => setShowOverlay(mediaQuery.matches);

    updateVisibility();
    mediaQuery.addEventListener("change", updateVisibility);

    return () => {
      mediaQuery.removeEventListener("change", updateVisibility);
    };
  }, []);

  if (!showOverlay) {
    return null;
  }

  return (
    <div
      className="mobile-landscape-overlay pointer-events-auto fixed inset-0 z-[9999] items-center justify-center bg-white px-6 text-center text-gray-900"
      aria-hidden="true"
    >
      <div className="max-w-sm space-y-3">
        <p className="text-5xl leading-none" role="img" aria-label="Ruota il telefono">
          📱
        </p>
        <p className="text-2xl font-semibold">Ruota il telefono in verticale</p>
        <p className="text-base text-gray-600">
          Per una visualizzazione migliore, usa Dance With Me in modalità verticale.
        </p>
      </div>
    </div>
  );
}

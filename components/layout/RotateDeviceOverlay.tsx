"use client";

export function RotateDeviceOverlay() {
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

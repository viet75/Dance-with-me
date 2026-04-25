"use client";

import { useState } from "react";

export function EnableNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);

    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  };

  const enableNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      setErrorMessage("Questo browser non supporta le notifiche push.");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      setErrorMessage("Chiave VAPID pubblica non configurata.");
      return;
    }

    setIsActivating(true);
    setErrorMessage(null);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setErrorMessage("Permesso notifiche non concesso.");
        return;
      }

      await navigator.serviceWorker.register("/sw.js");
      const registration = await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Errore durante il salvataggio della sottoscrizione.");
      }

      setEnabled(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Errore inatteso durante l'attivazione delle notifiche.";
      setErrorMessage(message);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5 shadow-sm sm:p-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Resta aggiornato</h2>
        <p className="text-sm leading-6 text-gray-600">
          Ricevi avvisi su lezioni, eventi e comunicazioni importanti della scuola.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={enableNotifications}
          disabled={enabled || isActivating}
          className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {enabled ? "Notifiche attive" : isActivating ? "Attivazione..." : "Attiva notifiche"}
        </button>
        {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
      </div>
    </section>
  );
}

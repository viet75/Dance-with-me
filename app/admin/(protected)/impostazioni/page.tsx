"use client";

import { FormEvent, useEffect, useState } from "react";

import { Card } from "@/components/shared/Card";
import { supabase } from "@/lib/supabase/client";

type SiteSettingsAdmin = {
  id?: string;
  school_name: string;
  hero_title: string;
  hero_subtitle: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  maps_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
};

const initialSettings: SiteSettingsAdmin = {
  school_name: "",
  hero_title: "",
  hero_subtitle: "",
  phone: "",
  email: "",
  whatsapp: "",
  address: "",
  maps_url: "",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
};

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getReadableErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return message ? `${prefix}: ${message}` : prefix;
}

export default function AdminImpostazioniPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [form, setForm] = useState<SiteSettingsAdmin>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase.from("site_settings").select("*").limit(1);

      if (error) {
        console.error("[ERROR][SiteSettings]", error);
        setErrorMessage("Errore durante il caricamento delle impostazioni.");
        setIsLoading(false);
        return;
      }

      const first = data?.[0] as Partial<SiteSettingsAdmin> & { id: string } | undefined;

      if (first) {
        setSettingsId(first.id);
        setForm({
          school_name: first.school_name ?? "",
          hero_title: first.hero_title ?? "",
          hero_subtitle: first.hero_subtitle ?? "",
          phone: first.phone ?? "",
          email: first.email ?? "",
          whatsapp: first.whatsapp ?? "",
          address: first.address ?? "",
          maps_url: first.maps_url ?? "",
          facebook_url: first.facebook_url ?? "",
          instagram_url: first.instagram_url ?? "",
          youtube_url: first.youtube_url ?? "",
        });
      }

      setIsLoading(false);
    };

    void fetchSettings();
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const email = form.email.trim();
    const mapsUrl = form.maps_url.trim();
    const facebookUrl = form.facebook_url.trim();
    const instagramUrl = form.instagram_url.trim();
    const youtubeUrl = form.youtube_url.trim();

    if (email && !isValidEmail(email)) {
      setErrorMessage("Inserisci un indirizzo email valido");
      return;
    }

    const urlFields = [mapsUrl, facebookUrl, instagramUrl, youtubeUrl].filter(Boolean);
    if (urlFields.some((url) => !isValidUrl(url))) {
      setErrorMessage("Inserisci un URL valido");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      school_name: form.school_name.trim() || null,
      hero_title: form.hero_title.trim() || null,
      hero_subtitle: form.hero_subtitle.trim() || null,
      phone: form.phone.trim() || null,
      email: email || null,
      whatsapp: form.whatsapp.trim() || null,
      address: form.address.trim() || null,
      maps_url: mapsUrl || null,
      facebook_url: facebookUrl || null,
      instagram_url: instagramUrl || null,
      youtube_url: youtubeUrl || null,
    };

    const { data, error } = settingsId
      ? await supabase.from("site_settings").update(payload).eq("id", settingsId).select("id").single()
      : await supabase.from("site_settings").insert(payload).select("id").single();

    if (error) {
      console.error("[ERROR][SiteSettings]", error);
      setErrorMessage(error.message || getReadableErrorMessage("Errore durante il salvataggio delle impostazioni", error));
      setIsSubmitting(false);
      return;
    }

    if (!settingsId && data?.id) {
      setSettingsId(data.id);
    }

    setSuccessMessage("Salvataggio completato");
    setIsSubmitting(false);
  };

  return (
    <section className="min-w-0 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Impostazioni sito</h1>
        <p className="mt-1 text-sm text-gray-600">Aggiorna i contenuti principali e i contatti del sito.</p>
      </div>

      {isLoading ? (
        <Card>
          <p className="text-sm text-gray-600">Caricamento impostazioni...</p>
        </Card>
      ) : (
        <Card>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">Nome scuola</span>
              <input
                value={form.school_name}
                onChange={(event) => setForm((prev) => ({ ...prev, school_name: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">Titolo hero</span>
              <input
                value={form.hero_title}
                onChange={(event) => setForm((prev) => ({ ...prev, hero_title: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Sottotitolo hero</span>
              <textarea
                rows={2}
                value={form.hero_subtitle}
                onChange={(event) => setForm((prev) => ({ ...prev, hero_subtitle: event.target.value }))}
                className="min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">Telefono</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">WhatsApp</span>
              <input
                value={form.whatsapp}
                onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">Indirizzo</span>
              <input
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">Google Maps URL</span>
              <input
                value={form.maps_url}
                onChange={(event) => setForm((prev) => ({ ...prev, maps_url: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">Facebook URL</span>
              <input
                value={form.facebook_url}
                onChange={(event) => setForm((prev) => ({ ...prev, facebook_url: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm">
              <span className="font-medium text-gray-700">Instagram URL</span>
              <input
                value={form.instagram_url}
                onChange={(event) => setForm((prev) => ({ ...prev, instagram_url: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
              <span className="font-medium text-gray-700">YouTube URL</span>
              <input
                value={form.youtube_url}
                onChange={(event) => setForm((prev) => ({ ...prev, youtube_url: event.target.value }))}
                className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              />
            </label>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? "Salvataggio..." : "Salva impostazioni"}
              </button>
            </div>
          </form>
        </Card>
      )}

      {successMessage ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p> : null}
      {errorMessage ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}
    </section>
  );
}

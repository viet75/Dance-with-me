"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { Card } from "@/components/shared/Card";
import { supabase } from "@/lib/supabase/client";

type VideoAdmin = {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  display_order: number;
  is_featured: boolean;
  updated_at: string;
};

type VideoFormState = {
  title: string;
  description: string;
  youtube_url: string;
  display_order: string;
};

const initialFormState: VideoFormState = {
  title: "",
  description: "",
  youtube_url: "",
  display_order: "0",
};
const MAX_FEATURED_VIDEOS = 3;
const FEATURED_LIMIT_ERROR = "Puoi mostrare massimo 3 video in Home. Deseleziona prima un altro video.";

function isPlausibleYoutubeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.replace("www.", "");
    return host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com";
  } catch {
    return false;
  }
}

function getReadableErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return message ? `${prefix}: ${message}` : prefix;
}

export default function AdminVideoPage() {
  const [videos, setVideos] = useState<VideoAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<string | null>(null);
  const [form, setForm] = useState<VideoFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("videos")
      .select("id, title, description, youtube_url, display_order, is_featured, updated_at")
      .order("display_order", { ascending: true });

    if (error) {
      setErrorMessage("Errore durante il caricamento dei video.");
      setVideos([]);
    } else {
      setVideos((data ?? []) as VideoAdmin[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchVideos();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchVideos]);

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const title = form.title.trim();
    const youtubeUrl = form.youtube_url.trim();
    const order = Number(form.display_order);

    if (!title) {
      setErrorMessage("Inserisci un titolo");
      return;
    }

    if (!youtubeUrl) {
      setErrorMessage("Inserisci un link YouTube");
      return;
    }

    if (!isPlausibleYoutubeUrl(youtubeUrl)) {
      setErrorMessage("Inserisci un link YouTube valido");
      return;
    }

    if (Number.isNaN(order) || order < 0) {
      setErrorMessage("Inserisci un ordine valido");
      return;
    }

    const payload = {
      title,
      description: form.description.trim() || null,
      youtube_url: youtubeUrl,
      display_order: order,
    };

    setIsSubmitting(true);

    const { error } = editingId
      ? await supabase.from("videos").update(payload).eq("id", editingId)
      : await supabase.from("videos").insert({ ...payload, is_active: true });

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante il salvataggio del video", error));
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Salvataggio completato");
    setIsSubmitting(false);
    resetForm();
    await fetchVideos();
  };

  const onEdit = (video: VideoAdmin) => {
    setEditingId(video.id);
    setForm({
      title: video.title,
      description: video.description ?? "",
      youtube_url: video.youtube_url,
      display_order: String(video.display_order),
    });
  };

  const onToggleFeatured = async (id: string, nextValue: boolean) => {
    if (updatingFeaturedId) {
      return;
    }

    const currentRow = videos.find((video) => video.id === id);
    if (!currentRow) {
      return;
    }

    if (
      nextValue &&
      !currentRow.is_featured &&
      videos.filter((video) => video.is_featured && video.id !== id).length >= MAX_FEATURED_VIDEOS
    ) {
      setErrorMessage(FEATURED_LIMIT_ERROR);
      setSuccessMessage(null);
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingFeaturedId(id);

    const { error } = await supabase.from("videos").update({ is_featured: nextValue }).eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'aggiornamento della Home", error));
      setUpdatingFeaturedId(null);
      return;
    }

    setVideos((prev) => prev.map((row) => (row.id === id ? { ...row, is_featured: nextValue } : row)));
    setUpdatingFeaturedId(null);
  };

  const onDelete = async (id: string) => {
    const shouldDelete = window.confirm("Vuoi eliminare questo video?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.from("videos").delete().eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'eliminazione del video", error));
      setDeletingId(null);
      return;
    }

    setSuccessMessage("Elemento eliminato");
    setDeletingId(null);
    await fetchVideos();
  };

  return (
    <section className="min-w-0 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestione video</h1>
        <p className="mt-1 text-sm text-gray-600">Gestisci i video visibili sul sito con ordinamento personalizzato.</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Titolo</span>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              required
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Descrizione</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Link YouTube</span>
            <input
              value={form.youtube_url}
              onChange={(event) => setForm((prev) => ({ ...prev, youtube_url: event.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              required
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Ordine</span>
            <input
              type="number"
              min={0}
              value={form.display_order}
              onChange={(event) => setForm((prev) => ({ ...prev, display_order: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              required
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Salvataggio..." : editingId ? "Salva" : "Aggiungi"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="min-h-11 shrink-0 rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annulla
              </button>
            ) : null}
          </div>
        </form>
      </Card>

      {successMessage ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p> : null}
      {errorMessage ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

      <Card>
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Lista video</h2>
          <button
            type="button"
            onClick={fetchVideos}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Aggiorna
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-600">Caricamento video...</p>
        ) : videos.length === 0 ? (
          <p className="text-sm text-gray-600">Nessun video presente.</p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-gray-500">
                  <th className="py-2 pr-3">Titolo</th>
                  <th className="py-2 pr-3">Link</th>
                  <th className="py-2 px-3 text-center">Ordine</th>
                  <th className="py-2 px-3 text-center">Home</th>
                  <th className="py-2 pl-3 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id} className="border-b border-border/70">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-gray-900">{video.title}</p>
                      <p className="line-clamp-2 max-w-[24rem] text-xs text-gray-500">{video.description || "-"}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-2 hover:underline"
                      >
                        Apri video
                      </a>
                    </td>
                    <td className="py-3 px-3 text-center align-middle">{video.display_order}</td>
                    <td className="py-3 px-3 align-middle">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={video.is_featured}
                          onChange={(event) => void onToggleFeatured(video.id, event.target.checked)}
                          disabled={updatingFeaturedId === video.id}
                          className="h-5 w-5 shrink-0 rounded border-border"
                          aria-label={video.is_featured ? "Mostrato in Home" : "Non mostrato in Home"}
                        />
                      </div>
                    </td>
                    <td className="py-3 pl-3 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(video)}
                          className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-md border border-border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(video.id)}
                          disabled={deletingId === video.id}
                          className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === video.id ? "Elimino..." : "Elimina"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

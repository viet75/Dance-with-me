"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { Card } from "@/components/shared/Card";
import { supabase } from "@/lib/supabase/client";
import { formatNewsDateTime, getNewsContentPreview } from "@/lib/utils/news";
import { getYouTubeVideoId } from "@/lib/utils/youtube";

type NewsAdmin = {
  id: string;
  title: string;
  slug: string | null;
  content: string | null;
  cover_image: string | null;
  youtube_url: string | null;
  is_published: boolean;
  published_at: string | null;
  updated_at: string;
};

type NewsFormState = {
  title: string;
  slug: string;
  content: string;
  published_at: string;
  /** URL pubblico copertina già salvato (non URL digitato dall'utente) */
  cover_image: string;
  youtube_url: string;
};

const initialFormState: NewsFormState = {
  title: "",
  slug: "",
  content: "",
  published_at: "",
  cover_image: "",
  youtube_url: "",
};

function slugFromTitle(raw: string): string {
  const ascii = raw
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || "news";
}

function getReadableErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return message ? `${prefix}: ${message}` : prefix;
}

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }
  return new Date(value).toISOString().slice(0, 16);
}

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [removingCover, setRemovingCover] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingPublishedId, setUpdatingPublishedId] = useState<string | null>(null);
  const [form, setForm] = useState<NewsFormState>(initialFormState);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("news")
      .select("id, title, slug, content, cover_image, youtube_url, is_published, published_at, updated_at")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (error) {
      setErrorMessage("Errore durante il caricamento delle news.");
      setItems([]);
    } else {
      setItems((data ?? []) as NewsAdmin[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchNews();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchNews]);

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
    setSelectedCoverFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onCoverFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedCoverFile(file);
  };

  const onRemoveCover = async () => {
    if (isSubmitting || uploadingCover || removingCover) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setRemovingCover(true);

    setSelectedCoverFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!editingId) {
      setForm((prev) => ({ ...prev, cover_image: "" }));
      setRemovingCover(false);
      return;
    }

    const { error } = await supabase.from("news").update({ cover_image: null }).eq("id", editingId);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante la rimozione dell'immagine", error));
      setRemovingCover(false);
      return;
    }

    setForm((prev) => ({ ...prev, cover_image: "" }));
    setItems((prev) => prev.map((row) => (row.id === editingId ? { ...row, cover_image: null } : row)));
    setSuccessMessage("Immagine di copertina rimossa.");
    setRemovingCover(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || uploadingCover) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const title = form.title.trim();
    if (!title) {
      setErrorMessage("Inserisci un titolo");
      return;
    }

    const content = form.content.trim();
    if (!content) {
      setErrorMessage("Inserisci il contenuto");
      return;
    }

    let slug = form.slug.trim();
    if (!slug) {
      slug = slugFromTitle(title);
    }

    const youtubeRaw = form.youtube_url.trim();
    if (youtubeRaw && !getYouTubeVideoId(youtubeRaw)) {
      setErrorMessage("Inserisci un link YouTube valido oppure lascia il campo vuoto.");
      return;
    }

    let cover_image: string | null = form.cover_image.trim() || null;

    if (selectedCoverFile) {
      setUploadingCover(true);
      const extension = selectedCoverFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `news/news-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("gallery").upload(filePath, selectedCoverFile, {
        cacheControl: "3600",
        contentType: selectedCoverFile.type || "image/jpeg",
        upsert: false,
      });

      if (uploadError) {
        setErrorMessage(getReadableErrorMessage("Errore durante il caricamento dell'immagine", uploadError));
        setUploadingCover(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("gallery").getPublicUrl(filePath);

      if (!publicUrl) {
        setErrorMessage("Impossibile ottenere l'URL pubblico dell'immagine.");
        setUploadingCover(false);
        return;
      }

      cover_image = publicUrl;
      setUploadingCover(false);
    }

    const payload = {
      title,
      slug,
      content,
      cover_image,
      youtube_url: youtubeRaw || null,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
    };

    setIsSubmitting(true);

    const { error } = editingId
      ? await supabase.from("news").update(payload).eq("id", editingId)
      : await supabase.from("news").insert({ ...payload, is_published: true });

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante il salvataggio della news", error));
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Salvataggio completato");
    setIsSubmitting(false);
    resetForm();
    await fetchNews();
  };

  const onEdit = (item: NewsAdmin) => {
    setEditingId(item.id);
    setSelectedCoverFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setForm({
      title: item.title,
      slug: item.slug ?? "",
      content: item.content ?? "",
      published_at: toDateTimeLocal(item.published_at),
      cover_image: item.cover_image ?? "",
      youtube_url: item.youtube_url ?? "",
    });
  };

  const onTogglePublished = async (id: string, nextValue: boolean) => {
    if (updatingPublishedId) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingPublishedId(id);

    const { error } = await supabase.from("news").update({ is_published: nextValue }).eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'aggiornamento dello stato", error));
      setUpdatingPublishedId(null);
      return;
    }

    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, is_published: nextValue } : row)));
    setUpdatingPublishedId(null);
  };

  const onDelete = async (id: string) => {
    const shouldDelete = window.confirm("Vuoi eliminare questa news?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'eliminazione della news", error));
      setDeletingId(null);
      return;
    }

    setSuccessMessage("Elemento eliminato");
    setDeletingId(null);
    await fetchNews();
  };

  return (
    <section className="min-w-0 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestione news</h1>
        <p className="mt-1 text-sm text-gray-600">Gestisci i contenuti news pubblicati nel sito.</p>
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
            <span className="font-medium text-gray-700">Slug</span>
            <input
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="Lasciare vuoto per generazione automatica dal titolo"
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Contenuto</span>
            <textarea
              rows={8}
              value={form.content}
              onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              className="min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:text-sm"
              required
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Data pubblicazione</span>
            <input
              type="datetime-local"
              value={form.published_at}
              onChange={(event) => setForm((prev) => ({ ...prev, published_at: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Link YouTube</span>
            <input
              type="url"
              value={form.youtube_url}
              onChange={(event) => setForm((prev) => ({ ...prev, youtube_url: event.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
            <span className="text-xs text-gray-500">Opzionale. Incolla il link del video (non si caricano file sul sito).</span>
          </label>

          <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Immagine di copertina</span>
            {form.cover_image ? (
              <div className="rounded-xl border border-border bg-gray-50 p-3">
                <img
                  src={form.cover_image}
                  alt="Copertina attuale"
                  className="h-auto max-h-72 w-full max-w-full rounded-xl border object-cover"
                />
              </div>
            ) : null}
            <input
              ref={fileInputRef}
              id="news-cover-upload"
              type="file"
              accept="image/*"
              onChange={onCoverFileChange}
              className="hidden"
            />
            <label
              htmlFor="news-cover-upload"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 sm:w-auto sm:justify-start"
            >
              Seleziona immagine
            </label>
            {selectedCoverFile ? (
              <p className="break-words text-sm text-gray-600">File selezionato: {selectedCoverFile.name}</p>
            ) : null}
            {form.cover_image ? (
              <>
                <span className="text-xs text-gray-500">
                  Puoi sostituire l&apos;immagine con un nuovo file oppure rimuovere il riferimento dal record (il file sullo storage non viene cancellato).
                </span>
                <button
                  type="button"
                  onClick={() => void onRemoveCover()}
                  disabled={isSubmitting || uploadingCover || removingCover}
                  className="min-h-11 w-full rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {removingCover ? "Rimozione..." : "Rimuovi copertina"}
                </button>
              </>
            ) : (
              <span className="text-xs text-gray-500">Opzionale. Formati immagine consigliati: JPG, PNG, WebP.</span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || uploadingCover || removingCover}
              className="min-h-11 shrink-0 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingCover ? "Caricamento..." : isSubmitting ? "Salvataggio..." : editingId ? "Salva" : "Aggiungi"}
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
          <h2 className="text-lg font-semibold text-gray-900">Lista news</h2>
          <button
            type="button"
            onClick={fetchNews}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Aggiorna
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-600">Caricamento news...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-600">Nessuna news presente.</p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-gray-500">
                  <th className="py-2 pr-3">Titolo</th>
                  <th className="py-2 pr-3">Slug</th>
                  <th className="py-2 pr-3">Pubblicazione</th>
                  <th className="py-2 pr-3">Stato</th>
                  <th className="py-2">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border/70">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="line-clamp-2 max-w-[28rem] text-xs text-gray-500">{getNewsContentPreview(item.content) || "-"}</p>
                    </td>
                    <td className="py-3 pr-3">{item.slug || "-"}</td>
                    <td className="py-3 pr-3">{formatNewsDateTime(item.published_at) || "-"}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.is_published}
                          onChange={(event) => void onTogglePublished(item.id, event.target.checked)}
                          disabled={updatingPublishedId === item.id}
                          className="h-5 w-5 shrink-0 rounded border-border"
                          aria-label={item.is_published ? "Pubblicata" : "Bozza"}
                        />
                        <span className="text-gray-700">{item.is_published ? "Pubblicata" : "Bozza"}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === item.id ? "Elimino..." : "Elimina"}
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

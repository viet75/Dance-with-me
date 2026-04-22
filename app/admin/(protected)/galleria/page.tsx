"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { Card } from "@/components/shared/Card";
import { supabase } from "@/lib/supabase/client";
import type { GalleryImage } from "@/types/supabase";

type GalleryFormState = {
  title: string;
  display_order: string;
};

const initialFormState: GalleryFormState = {
  title: "",
  display_order: "0",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("it-IT");
}

function getReadableErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return message ? `${prefix}: ${message}` : prefix;
}

export default function AdminGalleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<GalleryFormState>(initialFormState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, title, image_url, display_order, is_active, created_at, updated_at")
      .order("display_order", { ascending: true });

    if (error) {
      setErrorMessage("Errore nel caricamento delle immagini.");
      setImages([]);
    } else {
      setImages((data ?? []) as GalleryImage[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchImages();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchImages]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onFileChange = (event: FormEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const title = form.title.trim();
    const displayOrder = Number(form.display_order);

    if (!selectedFile) {
      setErrorMessage("Seleziona un'immagine da caricare");
      setIsSubmitting(false);
      return;
    }

    if (Number.isNaN(displayOrder) || displayOrder < 0) {
      setErrorMessage("Inserisci un ordine valido");
      setIsSubmitting(false);
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const safeTitle = title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
    const fileName = `${Date.now()}-${safeTitle || "immagine"}-${crypto.randomUUID()}.${extension}`;
    const filePath = `admin/${fileName}`;
    const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (process.env.NODE_ENV === "development") {
      console.warn("[WARN][Gallery]", "Upload start", { filePath, fileName: selectedFile.name, fileSize: selectedFile.size });
    }

    const { error: uploadError } = await supabase.storage.from("gallery").upload(filePath, selectedFile, {
      cacheControl: "3600",
      contentType: selectedFile.type,
      upsert: false,
    });

    if (uploadError) {
      console.error("[ERROR][Gallery]", uploadError);
      setErrorMessage(getReadableErrorMessage("Errore durante il caricamento dell'immagine", uploadError));
      setIsSubmitting(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery").getPublicUrl(filePath);

    if (process.env.NODE_ENV === "development") {
      const shortPublicUrl = publicUrl ? `${publicUrl.slice(0, 80)}...` : "none";
      console.warn("[WARN][Gallery]", "Public URL generated", { filePath, url: shortPublicUrl });
    }

    if (!publicUrl) {
      console.error("[ERROR][Gallery]", { message: "Empty public URL", filePath });
      setErrorMessage("Impossibile ottenere l'URL pubblico dell'immagine.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title,
      image_url: publicUrl,
      display_order: displayOrder,
      is_active: true,
    };

    const { error } = await supabase.from("gallery_images").insert(payload);

    if (error) {
      console.error("[ERROR][Gallery]", error);
      setErrorMessage(getReadableErrorMessage("Errore durante il salvataggio dell'immagine", error));
      setIsSubmitting(false);
      return;
    }

    setForm(initialFormState);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setSuccessMessage("Salvataggio completato");
    setIsSubmitting(false);
    await fetchImages();
  };

  const onDelete = async (id: string) => {
    const shouldDelete = window.confirm(
      "Sei sicuro di voler eliminare questa immagine dalla galleria? Questa azione non puo essere annullata.",
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.from("gallery_images").delete().eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'eliminazione dell'immagine", error));
      setDeletingId(null);
      return;
    }

    setSuccessMessage("Elemento eliminato");
    setDeletingId(null);
    await fetchImages();
  };

  const onToggleVisibility = async (id: string, nextValue: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingVisibilityId(id);

    const { error } = await supabase.from("gallery_images").update({ is_active: nextValue }).eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'aggiornamento della visibilita", error));
      setUpdatingVisibilityId(null);
      return;
    }

    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, is_active: nextValue } : img)));
    setUpdatingVisibilityId(null);
  };

  return (
    <section className="min-w-0 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestione Galleria</h1>
        <p className="mt-1 text-sm text-gray-600">Aggiungi e gestisci le immagini mostrate nella galleria pubblica.</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900">Nuova immagine</h2>
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Titolo</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Immagine</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="min-h-11 w-full cursor-pointer rounded-lg border border-border px-3 py-2 text-base file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200 md:min-h-0 md:text-sm"
              required
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
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

          {previewUrl ? (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-gray-700">Anteprima</p>
              <img
                src={previewUrl}
                alt="Anteprima immagine selezionata"
                className="h-auto max-h-72 w-full max-w-full rounded-xl border border-border object-cover"
              />
            </div>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? "Salvataggio..." : "Aggiungi immagine"}
            </button>
          </div>
        </form>
      </Card>

      {successMessage ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p> : null}
      {errorMessage ? <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p> : null}

      <Card>
        <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Immagini in archivio</h2>
          <button
            type="button"
            onClick={fetchImages}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Aggiorna
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-600">Caricamento immagini...</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-gray-600">Nessuna immagine presente.</p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[740px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-gray-500">
                  <th className="py-2 pr-3">Titolo</th>
                  <th className="py-2 pr-3">Ordine</th>
                  <th className="py-2 pr-3">Visibile</th>
                  <th className="py-2 pr-3">Aggiornata</th>
                  <th className="py-2">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {images.map((image) => (
                  <tr key={image.id} className="border-b border-border/70">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-gray-900">{image.title}</p>
                      <p className="max-w-[24rem] truncate text-xs text-gray-500">{image.image_url}</p>
                    </td>
                    <td className="py-3 pr-3">{image.display_order}</td>
                    <td className="py-3 pr-3">
                      <input
                        type="checkbox"
                        checked={image.is_active}
                        onChange={(event) => void onToggleVisibility(image.id, event.target.checked)}
                        disabled={updatingVisibilityId === image.id}
                        className="h-4 w-4 rounded border-border"
                        aria-label="Visibile"
                      />
                    </td>
                    <td className="py-3 pr-3">{formatDate(image.updated_at)}</td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => onDelete(image.id)}
                        disabled={deletingId === image.id}
                        className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === image.id ? "Elimino..." : "Elimina"}
                      </button>
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

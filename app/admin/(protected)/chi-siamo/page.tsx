"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";

import { getAboutContent } from "@/lib/supabase/chi-siamo";
import { supabase } from "@/lib/supabase/client";
import type { AboutContent } from "@/types/supabase";

type ChiSiamoFormState = {
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  quote: string;
};

const initialForm: ChiSiamoFormState = {
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  quote: "",
};

function getReadableErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return message ? `${prefix}: ${message}` : prefix;
}

function rowToForm(row: AboutContent): ChiSiamoFormState {
  return {
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    description: row.description ?? "",
    image_url: row.image_url ?? "",
    quote: row.quote ?? "",
  };
}

export default function AdminChiSiamoPage() {
  const [form, setForm] = useState<ChiSiamoFormState>(initialForm);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data, error } = await getAboutContent();

      if (error) {
        setErrorMessage("Errore durante il caricamento dei contenuti.");
        setIsLoading(false);
        return;
      }

      if (data) {
        setRecordId(data.id);
        setForm(rowToForm(data));
      }

      setIsLoading(false);
    };

    void load();
  }, []);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setFile(next);
  };

  const onRemoveImage = async () => {
    if (isSubmitting || uploading || removingImage) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setRemovingImage(true);

    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!recordId) {
      setForm((prev) => ({ ...prev, image_url: "" }));
      setSuccessMessage("Immagine rimossa.");
      setRemovingImage(false);
      return;
    }

    const { data: updated, error } = await supabase
      .from("about_content")
      .update({ image_url: null })
      .eq("id", recordId)
      .select("*")
      .single();

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante la rimozione dell'immagine", error));
      setRemovingImage(false);
      return;
    }

    if (updated) {
      setForm(rowToForm(updated as AboutContent));
    } else {
      setForm((prev) => ({ ...prev, image_url: "" }));
    }

    setSuccessMessage("Immagine rimossa.");
    setRemovingImage(false);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || uploading) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    let image_url: string | null = form.image_url.trim() || null;

    if (file) {
      setUploading(true);
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const filePath = `chi-siamo/chi-siamo-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("gallery").upload(filePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

      if (uploadError) {
        setErrorMessage(getReadableErrorMessage("Errore durante il caricamento dell'immagine", uploadError));
        setUploading(false);
        setIsSubmitting(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("gallery").getPublicUrl(filePath);

      if (!publicUrl) {
        setErrorMessage("Impossibile ottenere l'URL pubblico dell'immagine.");
        setUploading(false);
        setIsSubmitting(false);
        return;
      }

      image_url = publicUrl;
      setUploading(false);
    }

    const title = form.title.trim();
    const subtitle = form.subtitle.trim() || null;
    const description = form.description.trim() || null;
    const quote = form.quote.trim() || null;

    const payload = {
      title,
      subtitle,
      description,
      image_url,
      quote,
    };

    if (recordId) {
      const { data: updated, error } = await supabase
        .from("about_content")
        .update(payload)
        .eq("id", recordId)
        .select("*")
        .single();

      if (error) {
        setErrorMessage(getReadableErrorMessage("Errore durante il salvataggio", error));
        setIsSubmitting(false);
        return;
      }

      if (updated) {
        setForm(rowToForm(updated as AboutContent));
      }

      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccessMessage("Salvataggio completato.");
      setIsSubmitting(false);
      return;
    }

    const { data: inserted, error } = await supabase.from("about_content").insert(payload).select("*").single();

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante il salvataggio", error));
      setIsSubmitting(false);
      return;
    }

    if (inserted) {
      setRecordId(inserted.id);
      setForm(rowToForm(inserted as AboutContent));
    }

    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSuccessMessage("Salvataggio completato.");
    setIsSubmitting(false);
  };

  return (
    <section className="min-w-0 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Chi siamo</h1>
        <p className="mt-1 text-sm text-gray-600">Modifica il testo e i link della pagina pubblica &quot;Chi siamo&quot;.</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-600">Caricamento contenuti...</p>
      ) : (
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-5 rounded-2xl border border-border bg-white p-4 shadow-sm md:grid-cols-2 md:gap-6 md:p-6"
        >
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Titolo</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base text-gray-900 outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Sottotitolo</span>
            <input
              type="text"
              value={form.subtitle}
              onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base text-gray-900 outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Descrizione</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={5}
              className="min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base text-gray-900 outline-none ring-primary/20 focus:ring md:text-sm"
            />
          </label>

          <div className="flex min-w-0 flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Immagine</span>
            {form.image_url ? (
              <div className="rounded-xl border border-border bg-gray-50 p-3">
                <img
                  src={form.image_url}
                  alt="Immagine attuale"
                  className="h-auto max-h-80 w-full max-w-full rounded-xl border object-cover shadow-sm"
                />
              </div>
            ) : null}
            <input ref={fileInputRef} id="image-upload" type="file" accept="image/*" onChange={onFileChange} className="hidden" />
            <label
              htmlFor="image-upload"
              className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 sm:w-auto sm:justify-start"
            >
              Seleziona immagine
            </label>
            {file ? <p className="break-words text-sm text-gray-600">File selezionato: {file.name}</p> : null}
            {form.image_url ? (
              <>
                <span className="text-xs text-gray-500">
                  Puoi sostituire l&apos;immagine caricandone una nuova oppure rimuoverla.
                </span>
                <p className="text-xs text-gray-500">Lascia vuoto per mantenere quella attuale.</p>
                <div>
                  <button
                    type="button"
                    onClick={() => void onRemoveImage()}
                    disabled={isSubmitting || uploading || removingImage}
                    className="min-h-11 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingImage ? "Rimozione..." : "Rimuovi immagine"}
                  </button>
                </div>
              </>
            ) : (
              <span className="text-xs text-gray-500">Carica un&apos;immagine per la sezione Chi siamo.</span>
            )}
          </div>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Citazione</span>
            <input
              type="text"
              value={form.quote}
              onChange={(event) => setForm((prev) => ({ ...prev, quote: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base text-gray-900 outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <div className="pt-1 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="min-h-11 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {uploading ? "Caricamento..." : isSubmitting ? "Salvataggio..." : "Salva"}
            </button>
          </div>
        </form>
      )}

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>
      ) : null}
    </section>
  );
}

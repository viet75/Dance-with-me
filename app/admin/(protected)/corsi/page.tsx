"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { Card } from "@/components/shared/Card";
import { TeacherAvatar } from "@/components/shared/TeacherAvatar";
import { supabase } from "@/lib/supabase/client";
import { generateSlug } from "@/lib/utils/slug";

type CourseAdmin = {
  id: string;
  title: string;
  teacher_name: string | null;
  teacher_image_url: string | null;
  slug: string | null;
  description: string | null;
  level: string | null;
  youtube_url: string | null;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

type CourseFormState = {
  title: string;
  teacher_name: string;
  teacher_image_url: string;
  description: string;
  level: string;
  youtube_url: string;
  display_order: string;
};

const initialFormState: CourseFormState = {
  title: "",
  teacher_name: "",
  teacher_image_url: "",
  description: "",
  level: "",
  youtube_url: "",
  display_order: "0",
};

function getReadableErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return message ? `${prefix}: ${message}` : prefix;
}

const MAX_TEACHER_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

function sanitizeFileName(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const safeBaseName = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${safeBaseName || "teacher"}-${Date.now()}.${extension}`;
}

export default function AdminCorsiPage() {
  const [courses, setCourses] = useState<CourseAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingTeacherImage, setUploadingTeacherImage] = useState(false);
  const [teacherImageStatusMessage, setTeacherImageStatusMessage] = useState<string | null>(null);
  const [isTeacherImageUnavailable, setIsTeacherImageUnavailable] = useState(false);
  const teacherImageInputRef = useRef<HTMLInputElement | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase
      .from("courses")
      .select("id, title, teacher_name, teacher_image_url, slug, description, level, youtube_url, display_order, is_active, updated_at")
      .order("display_order", { ascending: true });

    if (error) {
      setErrorMessage("Errore durante il caricamento dei corsi.");
      setCourses([]);
    } else {
      setCourses((data ?? []) as CourseAdmin[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCourses();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchCourses]);

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
    setTeacherImageStatusMessage(null);
    setUploadingTeacherImage(false);
    setIsTeacherImageUnavailable(false);
    if (teacherImageInputRef.current) {
      teacherImageInputRef.current.value = "";
    }
  };

  const onTeacherImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      setTeacherImageStatusMessage("Nessun file selezionato.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setTeacherImageStatusMessage(null);
    setIsTeacherImageUnavailable(false);

    if (!selectedFile.type.startsWith("image/")) {
      setErrorMessage("Puoi caricare solo file immagine.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_TEACHER_IMAGE_SIZE_BYTES) {
      setErrorMessage("La foto insegnante non puo superare 3MB.");
      event.target.value = "";
      return;
    }

    setUploadingTeacherImage(true);

    const filePath = `teacher-images/${sanitizeFileName(selectedFile.name)}`;
    const { error: uploadError } = await supabase.storage.from("gallery").upload(filePath, selectedFile, {
      cacheControl: "3600",
      contentType: selectedFile.type || "image/jpeg",
      upsert: false,
    });

    if (uploadError) {
      setErrorMessage(getReadableErrorMessage("Errore durante il caricamento della foto insegnante", uploadError));
      setUploadingTeacherImage(false);
      event.target.value = "";
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("gallery").getPublicUrl(filePath);

    if (!publicUrl) {
      setErrorMessage("Impossibile ottenere l'URL pubblico della foto insegnante.");
      setUploadingTeacherImage(false);
      event.target.value = "";
      return;
    }

    setForm((prev) => ({ ...prev, teacher_image_url: publicUrl }));
    setTeacherImageStatusMessage("Foto caricata con successo.");
    setIsTeacherImageUnavailable(false);
    setUploadingTeacherImage(false);
  };

  const onRemoveTeacherImage = () => {
    setForm((prev) => ({ ...prev, teacher_image_url: "" }));
    setTeacherImageStatusMessage("Foto rimossa dal corso.");
    setIsTeacherImageUnavailable(false);
    if (teacherImageInputRef.current) {
      teacherImageInputRef.current.value = "";
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || uploadingTeacherImage) {
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);

    const title = form.title.trim();
    const displayOrder = Number(form.display_order);

    if (!title) {
      setErrorMessage("Inserisci un titolo");
      return;
    }

    if (Number.isNaN(displayOrder) || displayOrder < 0) {
      setErrorMessage("Inserisci un ordine valido");
      return;
    }

    const resolvedSlug = generateSlug(title);

    if (!resolvedSlug) {
      setErrorMessage("Impossibile generare uno slug valido dal titolo");
      return;
    }

    const payload = {
      title,
      teacher_name: form.teacher_name.trim() || null,
      teacher_image_url: form.teacher_image_url.trim() || null,
      slug: resolvedSlug,
      description: form.description.trim() || null,
      level: form.level.trim() || null,
      youtube_url: form.youtube_url.trim() || null,
      display_order: displayOrder,
    };

    setIsSubmitting(true);

    const { error } = editingId
      ? await supabase.from("courses").update(payload).eq("id", editingId)
      : await supabase.from("courses").insert({ ...payload, is_active: true });

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante il salvataggio del corso", error));
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Salvataggio completato");
    setIsSubmitting(false);
    resetForm();
    await fetchCourses();
  };

  const onEdit = (course: CourseAdmin) => {
    setEditingId(course.id);
    setTeacherImageStatusMessage(null);
    setIsTeacherImageUnavailable(false);
    if (teacherImageInputRef.current) {
      teacherImageInputRef.current.value = "";
    }
    setForm({
      title: course.title,
      teacher_name: course.teacher_name ?? "",
      teacher_image_url: course.teacher_image_url ?? "",
      description: course.description ?? "",
      level: course.level ?? "",
      youtube_url: course.youtube_url ?? "",
      display_order: String(course.display_order),
    });
  };

  const onToggleStatus = async (id: string, nextValue: boolean) => {
    if (updatingStatusId) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingStatusId(id);

    const { error } = await supabase.from("courses").update({ is_active: nextValue }).eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'aggiornamento dello stato", error));
      setUpdatingStatusId(null);
      return;
    }

    setCourses((prev) => prev.map((course) => (course.id === id ? { ...course, is_active: nextValue } : course)));
    setUpdatingStatusId(null);
  };

  const onDelete = async (id: string) => {
    const shouldDelete = window.confirm("Vuoi eliminare questo corso?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) {
      setErrorMessage(getReadableErrorMessage("Errore durante l'eliminazione del corso", error));
      setDeletingId(null);
      return;
    }

    setSuccessMessage("Elemento eliminato");
    setDeletingId(null);
    await fetchCourses();
  };

  return (
    <section className="min-w-0 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestione corsi</h1>
        <p className="mt-1 text-sm text-gray-600">Gestisci i corsi mostrati sul sito.</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Titolo</span>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              required
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Insegnante</span>
            <input
              value={form.teacher_name}
              onChange={(event) => setForm((prev) => ({ ...prev, teacher_name: event.target.value }))}
              placeholder="Es. Nome insegnante"
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
            <span className="text-xs text-gray-500">
              Il nome dell&apos;insegnante verrà mostrato separatamente dal titolo.
            </span>
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Foto insegnante</span>
            <input
              ref={teacherImageInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => void onTeacherImageFileChange(event)}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base file:mr-3 file:rounded-full file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-violet-700 outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              disabled={uploadingTeacherImage}
            />
            <input
              value={form.teacher_image_url}
              placeholder="URL generato automaticamente"
              readOnly
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
            {uploadingTeacherImage ? <span className="text-xs text-gray-500">Upload in corso...</span> : null}
            {teacherImageStatusMessage ? <span className="text-xs text-gray-500">{teacherImageStatusMessage}</span> : null}
            {form.teacher_image_url ? (
              <div className="mt-2 flex items-center gap-3">
                <TeacherAvatar
                  imageUrl={form.teacher_image_url}
                  teacherName={form.teacher_name}
                  courseTitle={form.title}
                  className="sm:h-14 sm:w-14"
                  onImageErrorChange={setIsTeacherImageUnavailable}
                />
                <button
                  type="button"
                  onClick={onRemoveTeacherImage}
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Rimuovi foto
                </button>
              </div>
            ) : null}
            {form.teacher_image_url && isTeacherImageUnavailable ? (
              <span className="text-xs text-gray-500">Immagine non disponibile</span>
            ) : null}
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Descrizione</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              className="min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Link YouTube</span>
            <input
              value={form.youtube_url}
              onChange={(event) => setForm((prev) => ({ ...prev, youtube_url: event.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Livello</span>
            <input
              value={form.level}
              onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
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
              disabled={isSubmitting || uploadingTeacherImage}
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
          <h2 className="text-lg font-semibold text-gray-900">Lista corsi</h2>
          <button
            type="button"
            onClick={fetchCourses}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Aggiorna
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-600">Caricamento corsi...</p>
        ) : courses.length === 0 ? (
          <p className="text-sm text-gray-600">Nessun corso disponibile.</p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-gray-500">
                  <th className="py-2 pr-3">Corso</th>
                  <th className="py-2 pr-3">Livello</th>
                  <th className="py-2 pr-3">Ordine</th>
                  <th className="py-2 pr-3">Stato</th>
                  <th className="py-2">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-border/70">
                    <td className="py-3 pr-3">
                      <div>
                        <p className="font-medium text-gray-900">{course.title}</p>
                        {course.teacher_name ? (
                          <p className="text-xs text-gray-500">Insegnante: {course.teacher_name}</p>
                        ) : null}
                        <p className="text-xs text-gray-500">{course.slug || generateSlug(course.title)}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-3">{course.level || "-"}</td>
                    <td className="py-3 pr-3">{course.display_order}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={course.is_active}
                          onChange={(event) => void onToggleStatus(course.id, event.target.checked)}
                          disabled={updatingStatusId === course.id}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span>{course.is_active ? "Attivo" : "Non attivo"}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(course)}
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(course.id)}
                          disabled={deletingId === course.id}
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === course.id ? "Elimino..." : "Elimina"}
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

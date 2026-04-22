"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Card } from "@/components/shared/Card";
import { supabase } from "@/lib/supabase/client";

type CourseOption = {
  id: string;
  title: string | null;
  name?: string | null;
};

type ScheduleAdmin = {
  id: string;
  course_id: string | null;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher: string | null;
  room: string | null;
  notes: string | null;
  is_active: boolean;
  updated_at: string;
};

type ScheduleFormState = {
  course_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher: string;
  room: string;
  notes: string;
};

const dayOptions = [
  { value: "lunedi", label: "Lunedi" },
  { value: "martedi", label: "Martedi" },
  { value: "mercoledi", label: "Mercoledi" },
  { value: "giovedi", label: "Giovedi" },
  { value: "venerdi", label: "Venerdi" },
  { value: "sabato", label: "Sabato" },
  { value: "domenica", label: "Domenica" },
];

const initialFormState: ScheduleFormState = {
  course_id: "",
  day_of_week: "lunedi",
  start_time: "",
  end_time: "",
  teacher: "",
  room: "",
  notes: "",
};

function getReadableErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  return message ? `${prefix}: ${message}` : prefix;
}

function isValidTime(value: string) {
  const minutes = Number(value.split(":")[1]);
  return minutes % 5 === 0;
}

function formatTime(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

export default function AdminOrariPage() {
  const [schedules, setSchedules] = useState<ScheduleAdmin[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleFormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const courseNameById = useMemo(() => {
    return courses.reduce<Record<string, string>>((accumulator, course) => {
      accumulator[course.id] = course.title || course.name || "Corso";
      return accumulator;
    }, {});
  }, [courses]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const [schedulesResult, coursesResult] = await Promise.all([
      supabase
        .from("schedules")
        .select("id, course_id, day_of_week, start_time, end_time, teacher, room, notes, is_active, updated_at")
        .order("day_of_week", { ascending: true }),
      supabase
        .from("courses")
        .select("id, title, is_active, display_order")
        .order("display_order", { ascending: true }),
    ]);

    if (schedulesResult.error) {
      console.error("[ERROR][Schedules]", schedulesResult.error);
      setErrorMessage("Errore durante il caricamento degli orari.");
      setSchedules([]);
    } else {
      setSchedules((schedulesResult.data ?? []) as ScheduleAdmin[]);
    }

    if (coursesResult.error) {
      console.error("[ERROR][Schedules]", coursesResult.error);
      setCourses([]);
    } else {
      setCourses((coursesResult.data ?? []) as CourseOption[]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchData]);

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

    if (!form.course_id) {
      setErrorMessage("Seleziona un corso");
      return;
    }

    if (!form.day_of_week) {
      setErrorMessage("Seleziona un giorno della settimana");
      return;
    }

    if (!form.start_time) {
      setErrorMessage("Inserisci l'orario di inizio");
      return;
    }

    if (!form.end_time) {
      setErrorMessage("Inserisci l'orario di fine");
      return;
    }

    if (!isValidTime(form.start_time) || !isValidTime(form.end_time)) {
      setErrorMessage("Inserisci orari validi (multipli di 5 minuti)");
      return;
    }

    if (form.end_time <= form.start_time) {
      setErrorMessage("L'orario di fine deve essere successivo all'orario di inizio");
      return;
    }

    const payload = {
      course_id: form.course_id,
      day_of_week: form.day_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      teacher: form.teacher.trim() || null,
      room: form.room.trim() || null,
      notes: form.notes.trim() || null,
    };

    setIsSubmitting(true);

    const { error } = editingId
      ? await supabase.from("schedules").update(payload).eq("id", editingId)
      : await supabase.from("schedules").insert({ ...payload, is_active: true });

    if (error) {
      console.error("[ERROR][Schedules]", error);
      setErrorMessage(getReadableErrorMessage("Errore durante il salvataggio dell'orario", error));
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage("Salvataggio completato");
    setIsSubmitting(false);
    resetForm();
    await fetchData();
  };

  const onEdit = (schedule: ScheduleAdmin) => {
    setEditingId(schedule.id);
    setForm({
      course_id: schedule.course_id ?? "",
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      teacher: schedule.teacher ?? "",
      room: schedule.room ?? "",
      notes: schedule.notes ?? "",
    });
  };

  const onToggleStatus = async (id: string, nextValue: boolean) => {
    if (updatingStatusId) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setUpdatingStatusId(id);

    const { error } = await supabase.from("schedules").update({ is_active: nextValue }).eq("id", id);

    if (error) {
      console.error("[ERROR][Schedules]", error);
      setErrorMessage(getReadableErrorMessage("Errore durante l'aggiornamento dello stato", error));
      setUpdatingStatusId(null);
      return;
    }

    setSchedules((prev) =>
      prev.map((schedule) => (schedule.id === id ? { ...schedule, is_active: nextValue } : schedule)),
    );
    setUpdatingStatusId(null);
  };

  const onDelete = async (id: string) => {
    const shouldDelete = window.confirm("Vuoi eliminare questo orario?");
    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.from("schedules").delete().eq("id", id);

    if (error) {
      console.error("[ERROR][Schedules]", error);
      setErrorMessage(getReadableErrorMessage("Errore durante l'eliminazione dell'orario", error));
      setDeletingId(null);
      return;
    }

    setSuccessMessage("Elemento eliminato");
    setDeletingId(null);
    await fetchData();
  };

  return (
    <section className="min-w-0 space-y-5 md:space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Gestione orari</h1>
        <p className="mt-1 text-sm text-gray-600">Gestisci gli orari dei corsi visibili sul sito pubblico.</p>
      </div>

      <Card>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Corso</span>
            <select
              value={form.course_id}
              onChange={(event) => setForm((prev) => ({ ...prev, course_id: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              required
            >
              <option value="">Seleziona corso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || course.name || "Corso"}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Giorno</span>
            <select
              value={form.day_of_week}
              onChange={(event) => setForm((prev) => ({ ...prev, day_of_week: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            >
              {dayOptions.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Ora inizio</span>
            <input
              type="time"
              value={form.start_time}
              onChange={(event) => setForm((prev) => ({ ...prev, start_time: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              required
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Ora fine</span>
            <input
              type="time"
              value={form.end_time}
              onChange={(event) => setForm((prev) => ({ ...prev, end_time: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
              required
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Insegnante</span>
            <input
              value={form.teacher}
              onChange={(event) => setForm((prev) => ({ ...prev, teacher: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm">
            <span className="font-medium text-gray-700">Sala</span>
            <input
              value={form.room}
              onChange={(event) => setForm((prev) => ({ ...prev, room: event.target.value }))}
              className="min-h-11 min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:min-h-0 md:text-sm"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2 text-sm md:col-span-2">
            <span className="font-medium text-gray-700">Note</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
              className="min-w-0 w-full rounded-lg border border-border px-3 py-2 text-base outline-none ring-primary/20 focus:ring md:text-sm"
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
          <h2 className="text-lg font-semibold text-gray-900">Lista orari</h2>
          <button
            type="button"
            onClick={fetchData}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Aggiorna
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-600">Caricamento orari...</p>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-gray-600">Nessun orario presente.</p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-gray-500">
                  <th className="py-2 pr-3">Corso</th>
                  <th className="py-2 pr-3">Giorno</th>
                  <th className="py-2 pr-3">Orario</th>
                  <th className="py-2 pr-3">Insegnante / Sala</th>
                  <th className="py-2 pr-3">Stato</th>
                  <th className="py-2">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-border/70">
                    <td className="py-3 pr-3">{(schedule.course_id && courseNameById[schedule.course_id]) || "-"}</td>
                    <td className="py-3 pr-3">
                      {dayOptions.find((day) => day.value === schedule.day_of_week)?.label || schedule.day_of_week}
                    </td>
                    <td className="py-3 pr-3">{`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}</td>
                    <td className="py-3 pr-3">{[schedule.teacher, schedule.room].filter(Boolean).join(" / ") || "-"}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={schedule.is_active}
                          onChange={(event) => void onToggleStatus(schedule.id, event.target.checked)}
                          disabled={updatingStatusId === schedule.id}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span>{schedule.is_active ? "Visibile" : "Nascosto"}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(schedule)}
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Modifica
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(schedule.id)}
                          disabled={deletingId === schedule.id}
                          className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === schedule.id ? "Elimino..." : "Elimina"}
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

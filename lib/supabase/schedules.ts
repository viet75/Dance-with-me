import { supabase } from "@/lib/supabase/client";
import type { Schedule as DbSchedule } from "@/types/supabase";

export type ScheduleView = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  course_title: string;
  teacher: string | null;
  room: string | null;
  notes: string | null;
};

export async function getActiveSchedules(): Promise<{
  data: ScheduleView[];
  error: string | null;
}> {
  const { data: schedules, error: schedulesError } = await supabase
    .from("schedules")
    .select("*")
    .eq("is_active", true)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (schedulesError) {
    return { data: [], error: "Impossibile caricare gli orari al momento." };
  }

  const { data: courses, error: coursesError } = await supabase.from("courses").select("id, title");

  if (coursesError) {
    return { data: [], error: "Impossibile caricare gli orari al momento." };
  }

  const coursesMap = new Map((courses ?? []).map((c) => [c.id, c.title]));

  const data: ScheduleView[] = (schedules ?? []).map((schedule: DbSchedule) => ({
    id: schedule.id,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    course_title: (schedule.course_id && coursesMap.get(schedule.course_id)) || "Corso",
    teacher: schedule.teacher ?? null,
    room: schedule.room ?? null,
    notes: schedule.notes ?? null,
  }));

  return { data, error: null };
}

export function formatTime(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

export function formatItalianDay(value: string): string {
  const days: Record<string, string> = {
    lunedi: "Lunedi",
    martedi: "Martedi",
    mercoledi: "Mercoledi",
    giovedi: "Giovedi",
    venerdi: "Venerdi",
    sabato: "Sabato",
    domenica: "Domenica",
  };

  return days[value] || value;
}

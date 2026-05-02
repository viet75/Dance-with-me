import { supabase } from "@/lib/supabase/client";
import type { Course as DbCourse } from "@/types/supabase";
import { generateSlug } from "@/lib/utils/slug";

export type CourseView = {
  id: string;
  title: string;
  teacher_name: string | null;
  teacher_image_url: string | null;
  slug: string | null;
  level: string | null;
  description: string | null;
  /** URL video incorporato (YouTube o Vimeo); colonna DB `youtube_url`. */
  youtube_url?: string | null;
  display_order: number;
  is_active: boolean;
};

export type CourseMutationInput = {
  title: string;
  teacher_name?: string | null;
  teacher_image_url?: string | null;
  slug: string;
  level?: string | null;
  description?: string | null;
  youtube_url?: string | null;
  display_order: number;
};

function mapCourseRow(row: DbCourse): CourseView {
  const title = row.title || "";
  const resolvedSlug = row.slug || generateSlug(title);

  return {
    id: row.id,
    title,
    teacher_name: row.teacher_name ?? null,
    teacher_image_url: row.teacher_image_url ?? null,
    slug: resolvedSlug || null,
    level: row.level ?? null,
    description: row.description ?? null,
    youtube_url: row.youtube_url ?? null,
    display_order: row.display_order,
    is_active: row.is_active,
  };
}

export async function getActiveCourses(): Promise<{
  data: CourseView[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("courses")
    .select("id,title,teacher_name,teacher_image_url,slug,level,description,youtube_url,display_order,is_active")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[ERROR][Courses]", error);
    return { data: [], error: "Impossibile caricare i corsi al momento." };
  }

  const courses = (data ?? []).map((course: DbCourse) => mapCourseRow(course));

  return { data: courses, error: null };
}

export async function getCourseBySlug(slug: string): Promise<{
  data: CourseView | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { data: null, error: "Impossibile caricare il corso al momento." };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: mapCourseRow(data as DbCourse), error: null };
}

function toCourseMutationPayload(input: CourseMutationInput) {
  return {
    title: input.title.trim(),
    teacher_name: input.teacher_name?.trim() || null,
    teacher_image_url: input.teacher_image_url?.trim() || null,
    slug: input.slug.trim(),
    level: input.level?.trim() || null,
    description: input.description?.trim() || null,
    youtube_url: input.youtube_url?.trim() || null,
    display_order: input.display_order,
  };
}

export async function createCourse(input: CourseMutationInput): Promise<{
  data: CourseView | null;
  error: string | null;
}> {
  const payload = toCourseMutationPayload(input);
  const { data, error } = await supabase.from("courses").insert({ ...payload, is_active: true }).select("*").single();

  if (error) {
    return { data: null, error: "Impossibile creare il corso al momento." };
  }

  return { data: mapCourseRow(data as DbCourse), error: null };
}

export async function updateCourse(id: string, input: CourseMutationInput): Promise<{
  data: CourseView | null;
  error: string | null;
}> {
  const payload = toCourseMutationPayload(input);
  const { data, error } = await supabase.from("courses").update(payload).eq("id", id).select("*").single();

  if (error) {
    return { data: null, error: "Impossibile aggiornare il corso al momento." };
  }

  return { data: mapCourseRow(data as DbCourse), error: null };
}

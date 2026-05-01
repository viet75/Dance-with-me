import { supabase } from "@/lib/supabase/client";
import type { Course as DbCourse } from "@/types/supabase";
import { generateSlug } from "@/lib/utils/slug";

export type CourseView = {
  id: string;
  title: string;
  teacher_name: string | null;
  slug: string | null;
  level: string | null;
  description: string | null;
  youtube_url?: string | null;
  display_order: number;
  is_active: boolean;
};

function mapCourseRow(row: DbCourse): CourseView {
  const title = row.title || "";
  const resolvedSlug = row.slug || generateSlug(title);

  return {
    id: row.id,
    title,
    teacher_name: row.teacher_name ?? null,
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
    .select("id,title,teacher_name,slug,level,description,youtube_url,display_order,is_active")
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

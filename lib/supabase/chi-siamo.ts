import { supabase } from "@/lib/supabase/client";
import type { AboutContent } from "@/types/supabase";

export async function getAboutContent(): Promise<{
  data: AboutContent | null;
  error: any;
}> {
  const { data, error } = await supabase.from("about_content").select("*").limit(1);

  if (error) {
    return { data: null, error };
  }

  const row = data?.[0] ?? null;
  return { data: row as AboutContent | null, error: null };
}

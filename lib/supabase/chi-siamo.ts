import { supabase } from "@/lib/supabase/client";
import type { AboutContent } from "@/types/supabase";

export async function getAboutContent(): Promise<{
  data: AboutContent | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from("about_content")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data: (data as AboutContent | null) ?? null, error };
}

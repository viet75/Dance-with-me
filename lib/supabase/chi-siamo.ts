import { supabase } from "@/lib/supabase/client";
import type { AboutContent } from "@/types/supabase";

export async function getAboutContent(): Promise<{
  data: AboutContent | null;
  error: any;
}> {
  const { data, error } = await supabase.from("about_content").select("*").maybeSingle();

  return { data: (data as AboutContent | null) ?? null, error };
}

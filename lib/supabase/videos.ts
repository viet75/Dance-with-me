import { supabase } from "@/lib/supabase/client";
import type { Video as DbVideo } from "@/types/supabase";

export { toYoutubeEmbedUrl } from "@/lib/utils/youtube";

export type VideoView = {
  id: string;
  title: string;
  youtube_url: string;
};

export async function getActiveVideos(): Promise<{
  data: VideoView[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, youtube_url, is_active, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return { data: [], error: "Impossibile caricare i video al momento." };
  }

  const videos = (data ?? []).map((video: DbVideo) => ({
    id: video.id,
    title: video.title,
    youtube_url: video.youtube_url,
  }));

  return { data: videos, error: null };
}

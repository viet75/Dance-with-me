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
    .select("id, title, youtube_url, is_active, is_featured, display_order")
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

export async function getFeaturedVideos(limit = 3): Promise<{
  data: VideoView[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("videos")
    .select("id, title, youtube_url, is_active, is_featured, display_order")
    .eq("is_featured", true)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    return { data: [], error: "Impossibile caricare i video in evidenza al momento." };
  }

  const videos = (data ?? []).map((video: DbVideo) => ({
    id: video.id,
    title: video.title,
    youtube_url: video.youtube_url,
  }));

  return { data: videos, error: null };
}

import { supabase } from "@/lib/supabase/client";

export type NewsView = {
  id: string;
  title: string;
  slug: string | null;
  published_at: string | null;
  cover_image: string | null;
  content: string;
  youtube_url: string | null;
};

export type NewsArticleDetail = {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  cover_image: string | null;
  youtube_url: string | null;
  published_at: string | null;
};

function mapNewsRow(item: Record<string, unknown>): NewsView {
  return {
    id: String(item.id),
    title: String(item.title ?? ""),
    slug: (item.slug as string | null | undefined) ?? null,
    published_at: (item.published_at as string | null | undefined) ?? null,
    cover_image: (item.cover_image as string | null | undefined) ?? null,
    content: String(item.content ?? ""),
    youtube_url: (item.youtube_url as string | null | undefined) ?? null,
  };
}

export async function getPublishedNews(limit?: number): Promise<{
  data: NewsView[];
  error: string | null;
}> {
  let query = supabase
    .from("news")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: "Impossibile caricare le news al momento." };
  }

  const news = (data ?? []).map((item) => mapNewsRow(item as Record<string, unknown>));

  return { data: news, error: null };
}

export async function getPublishedNewsArticleBySlug(slug: string): Promise<{
  data: NewsArticleDetail | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .eq("is_published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { data: null, error: "Impossibile caricare l'articolo." };
  }

  if (!data) {
    return { data: null, error: null };
  }

  const row = data as Record<string, unknown>;

  return {
    data: {
      id: String(row.id),
      title: String(row.title ?? ""),
      slug: (row.slug as string | null | undefined) ?? null,
      content: String(row.content ?? ""),
      cover_image: (row.cover_image as string | null | undefined) ?? null,
      youtube_url: (row.youtube_url as string | null | undefined) ?? null,
      published_at: (row.published_at as string | null | undefined) ?? null,
    },
    error: null,
  };
}

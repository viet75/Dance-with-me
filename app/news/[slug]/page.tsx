import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/shared/Container";
import { getPublishedNewsArticleBySlug } from "@/lib/supabase/news";
import { formatNewsDate, getNewsContentPreview } from "@/lib/utils/news";
import { toYoutubeEmbedUrl } from "@/lib/utils/youtube";

type NewsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getPublishedNewsArticleBySlug(slug);

  if (!data) {
    return { title: "News | Dance With Me" };
  }

  return {
    title: `${data.title} | Dance With Me`,
    description: getNewsContentPreview(data.content, 160) || undefined,
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const { data, error } = await getPublishedNewsArticleBySlug(slug);

  if (error || !data) {
    notFound();
  }

  const youtubeEmbedUrl = data.youtube_url ? toYoutubeEmbedUrl(data.youtube_url) : null;

  return (
    <article className="pb-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-gray-500">
          {formatNewsDate(data.published_at) || null}
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">{data.title}</h1>

        {data.cover_image ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-gray-50">
            <img
              src={data.cover_image}
              alt=""
              className="h-auto max-h-[480px] w-full object-cover"
            />
          </div>
        ) : null}

        {youtubeEmbedUrl ? (
          <div className="mt-8 min-w-0">
            <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black/5">
              <iframe
                title="Video YouTube"
                src={youtubeEmbedUrl}
                className="block h-full w-full max-w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}

        <div className="mt-10 whitespace-pre-wrap text-base leading-relaxed text-gray-800">{data.content}</div>

        <p className="mt-12 border-t border-border pt-8">
          <Link href="/news" className="text-sm font-semibold text-primary hover:text-violet-700">
            ← Tutte le news
          </Link>
        </p>
      </Container>
    </article>
  );
}

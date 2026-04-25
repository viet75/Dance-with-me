import type { Metadata } from "next";

import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { getPublishedNews } from "@/lib/supabase/news";
import { formatNewsDate } from "@/lib/utils/news";
import { toYoutubeEmbedUrl } from "@/lib/utils/youtube";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News | Dance With Me",
  description: "Leggi novita, eventi e annunci della scuola Dance With Me.",
};

export default async function NewsPage() {
  const { data: newsItems, error } = await getPublishedNews();

  return (
    <>
      <PagePlaceholder
        title="News"
        description="Aggiornamenti su open day, workshop, serate e nuove aperture corsi."
      />
      <Container className="pb-14">
        {error ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">{error}</p>
        ) : newsItems.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessuna novita disponibile al momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {newsItems.map((news) => {
              const youtubeEmbedUrl = news.youtube_url ? toYoutubeEmbedUrl(news.youtube_url) : null;
              const showVideoHero = Boolean(youtubeEmbedUrl);
              const showCoverHero = !showVideoHero && Boolean(news.cover_image);

              return (
                <article
                  key={news.id}
                  className="flex h-full min-w-0 flex-col space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  {showVideoHero && youtubeEmbedUrl ? (
                    <div className="min-w-0">
                      <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-black/5">
                        <iframe
                          title="Video YouTube"
                          src={youtubeEmbedUrl}
                          className="block h-full w-full max-w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : showCoverHero ? (
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={news.cover_image ?? undefined}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}

                  <p className="text-xs text-gray-500 sm:text-sm">
                    {formatNewsDate(news.published_at) || "-"}
                  </p>

                  <h2 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">{news.title}</h2>

                  {news.content.trim() ? (
                    <div className="whitespace-pre-wrap text-base leading-relaxed text-gray-800">{news.content}</div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}

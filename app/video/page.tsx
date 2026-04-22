import type { Metadata } from "next";

import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { getActiveVideos, toYoutubeEmbedUrl } from "@/lib/supabase/videos";

export const metadata: Metadata = {
  title: "Video | Dance With Me",
  description: "Guarda i video YouTube della scuola Dance With Me.",
};

export default async function VideoPage() {
  const { data: videos, error } = await getActiveVideos();
  const videosWithEmbed = videos
    .map((video) => ({
      ...video,
      embedUrl: toYoutubeEmbedUrl(video.youtube_url),
    }))
    .filter((video) => Boolean(video.embedUrl));

  return (
    <>
      <PagePlaceholder
        title="Video"
        description="Una selezione di video YouTube con performance e lezioni in evidenza."
      />
      <Container className="pb-14">
        {error ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">{error}</p>
        ) : videosWithEmbed.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessun video disponibile.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {videosWithEmbed.map((video) => (
              <article key={video.id} className="rounded-2xl border border-border bg-white p-3 shadow-sm">
                <div className="aspect-video overflow-hidden rounded-xl">
                  <iframe
                    title={video.title}
                    src={video.embedUrl!}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900">{video.title}</h3>
              </article>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

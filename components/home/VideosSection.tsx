import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Button } from "@/components/shared/Button";
import { getFeaturedVideos, toYoutubeEmbedUrl } from "@/lib/supabase/videos";

export async function VideosSection() {
  const { data: videos, error } = await getFeaturedVideos(3);
  const videosWithEmbed = videos
    .map((video) => ({
      ...video,
      embedUrl: toYoutubeEmbedUrl(video.youtube_url),
    }))
    .filter((video) => Boolean(video.embedUrl));

  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container>
        <SectionTitle
          title="Video in evidenza"
          description="Guarda esibizioni e performance direttamente dal nostro canale YouTube."
        />
        {error ? (
          <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">{error}</p>
        ) : videosWithEmbed.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessun video disponibile.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {videosWithEmbed.map((video) => (
                <article key={video.id} className="min-w-0 rounded-2xl border border-border bg-white p-2 shadow-sm sm:p-3">
                  <div className="aspect-video w-full min-w-0 overflow-hidden rounded-xl">
                    <iframe
                      title={video.title}
                      src={video.embedUrl!}
                      className="block h-full w-full max-w-full border-0"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <h3 className="mt-3 break-words text-sm font-semibold text-gray-900">{video.title}</h3>
                </article>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button href="/video">Guarda tutti i video</Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}

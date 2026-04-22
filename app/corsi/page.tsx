import type { Metadata } from "next";

import { CourseDescription } from "@/components/shared/CourseDescription";
import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { getActiveCourses } from "@/lib/supabase/courses";

export const metadata: Metadata = {
  title: "Corsi | Dance With Me",
  description: "Scopri i corsi disponibili di Dance With Me.",
};

function getYouTubeId(url?: string | null) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?&]+)/,
    /(?:youtube\.com\/embed\/)([^?&]+)/,
    /(?:youtube\.com\/shorts\/)([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export default async function CorsiPage() {
  const { data: courses, error } = await getActiveCourses();

  return (
    <>
      <PagePlaceholder
        title="Corsi"
        description="Scopri i corsi disponibili e trova il percorso piu adatto a te."
      />
      <Container className="pb-14">
        {error ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            I corsi non sono disponibili al momento.
          </p>
        ) : courses.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessun corso disponibile al momento.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {courses.map((course) => {
              const youtubeId = getYouTubeId(course.youtube_url);

              if (course.youtube_url && !youtubeId) {
                if (process.env.NODE_ENV === "development") {
                  const shortUrl = course.youtube_url.length > 80 ? `${course.youtube_url.slice(0, 80)}...` : course.youtube_url;
                  console.warn("[WARN][YouTube]", "Invalid URL", { courseId: course.id, url: shortUrl });
                }
              }

              return (
                <article
                  key={course.id}
                  className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-4">
                    {course.level ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{course.level}</p>
                    ) : null}
                    <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                    {course.description ? <CourseDescription text={course.description} /> : null}
                  </div>
                  {youtubeId ? (
                    <div className="mt-auto pt-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title={course.title}
                          className="h-full w-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
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

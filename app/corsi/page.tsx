import type { Metadata } from "next";

import { CourseDescription } from "@/components/shared/CourseDescription";
import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { TeacherAvatar } from "@/components/shared/TeacherAvatar";
import { getActiveCourses } from "@/lib/supabase/courses";
import { generateSlug } from "@/lib/utils/slug";
import { getVideoEmbedUrl } from "@/lib/utils/videoEmbed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corsi | Dance With Me",
  description: "Scopri i corsi disponibili di Dance With Me.",
};

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
              const stableSlug = course.slug || generateSlug(course.title);
              const embedUrl = getVideoEmbedUrl(course.youtube_url);

              if (course.youtube_url && !embedUrl) {
                if (process.env.NODE_ENV === "development") {
                  const shortUrl = course.youtube_url.length > 80 ? `${course.youtube_url.slice(0, 80)}...` : course.youtube_url;
                  console.warn("[WARN][video]", "Invalid URL", { courseId: course.id, url: shortUrl });
                }
              }

              return (
                <article
                  key={course.id}
                  id={stableSlug || undefined}
                  className="scroll-mt-24 flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex min-h-0 flex-1 flex-col gap-4">
                    {course.level ? (
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{course.level}</p>
                    ) : null}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="break-words text-xl font-semibold text-gray-900">{course.title}</h2>
                        {course.teacher_name ? <p className="mt-1 text-sm text-gray-500">Con {course.teacher_name}</p> : null}
                      </div>
                      <TeacherAvatar imageUrl={course.teacher_image_url} teacherName={course.teacher_name} courseTitle={course.title} />
                    </div>
                    {course.description ? <CourseDescription text={course.description} /> : null}
                  </div>
                  {embedUrl ? (
                    <div className="mt-auto pt-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                        <iframe
                          src={embedUrl}
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

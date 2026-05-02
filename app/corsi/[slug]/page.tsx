import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { getCourseBySlug } from "@/lib/supabase/courses";
import { getVideoEmbedUrl } from "@/lib/utils/videoEmbed";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getCourseBySlug(slug);
  if (!data) {
    return { title: "Corso | Dance With Me" };
  }
  return {
    title: `${data.title} | Dance With Me`,
    description: data.description ?? undefined,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: course, error } = await getCourseBySlug(slug);

  if (error || !course) {
    notFound();
  }

  const embedUrl = getVideoEmbedUrl(course.youtube_url);

  if (course.youtube_url && !embedUrl) {
    if (process.env.NODE_ENV === "development") {
      const raw = course.youtube_url;
      const shortUrl = raw.length > 80 ? `${raw.slice(0, 80)}...` : raw;
      console.warn("[WARN][video]", "Invalid URL", { courseId: course.id, url: shortUrl });
    }
  }

  return (
    <>
      <PagePlaceholder title={course.title} description="Dettagli del corso." />
      <Container className="pb-14">
        <Link href="/corsi" className="mb-6 inline-block text-sm font-medium text-primary hover:underline">
          ← Torna ai corsi
        </Link>
        <article className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {course.level ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{course.level}</p>
          ) : null}
          {course.teacher_name ? <p className="text-sm text-gray-500">Con {course.teacher_name}</p> : null}

          {course.description ? (
            <div className="max-w-none space-y-3 text-sm leading-relaxed text-gray-700">
              {course.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {embedUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={embedUrl}
                title={course.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : null}
        </article>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { getCourseBySlug } from "@/lib/supabase/courses";

type Props = {
  params: Promise<{ slug: string }>;
};

function getYouTubeId(url: string) {
  const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

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

  const youtubeId = course.youtube_url ? getYouTubeId(course.youtube_url.trim()) : null;

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

          {course.description ? (
            <div className="max-w-none space-y-3 text-sm leading-relaxed text-gray-700">
              {course.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {youtubeId ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
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

import Link from "next/link";

import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { getActiveCourses } from "@/lib/supabase/courses";

export async function FeaturedCoursesSection() {
  const { data: courses, error } = await getActiveCourses();

  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container>
        <SectionTitle
          eyebrow="Corsi in evidenza"
          title="Scegli il percorso adatto a te"
          description="Lezioni strutturate per livello con insegnanti qualificati."
        />
        {error ? (
          <p className="mt-8 break-words rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            {error}
          </p>
        ) : courses.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessun corso disponibile al momento.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {courses.map((course) => (
              <Link
                key={course.id}
                href="/corsi"
                className="flex min-h-[110px] min-w-0 flex-col justify-center rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <h3 className="break-words text-base font-semibold text-gray-900 sm:text-lg">{course.title}</h3>
                <span className="mt-2 text-sm font-medium text-primary">Scopri di più</span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

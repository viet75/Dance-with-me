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
                className="flex min-h-[110px] min-w-0 flex-col justify-center rounded-[2rem] border border-white/40 bg-gradient-to-br from-white via-purple-50/40 to-white px-6 py-6 shadow-[0_12px_36px_rgba(88,28,135,0.08)] transition-all duration-200 ease-out hover:shadow-[0_18px_48px_rgba(88,28,135,0.14)] active:scale-[0.98]"
              >
                <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-400" />
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-purple-500">Percorso</span>
                <h3 className="mt-2 break-words text-xl font-semibold tracking-tight text-gray-900">{course.title}</h3>
                {course.teacher_name ? (
                  <p className="mt-1 text-sm text-gray-500">Con {course.teacher_name}</p>
                ) : null}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-purple-600 transition-all duration-200 ease-out hover:text-purple-700">
                  Scopri di più <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

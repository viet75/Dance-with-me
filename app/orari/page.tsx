import type { Metadata } from "next";

import { Card } from "@/components/shared/Card";
import { Container } from "@/components/shared/Container";
import { PagePlaceholder } from "@/components/shared/PagePlaceholder";
import { formatItalianDay, formatTime, getActiveSchedules, type ScheduleView } from "@/lib/supabase/schedules";

export const metadata: Metadata = {
  title: "Orari | Dance With Me",
  description: "Visualizza gli orari settimanali dei corsi Dance With Me.",
};

const dayOrder = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];

function groupSchedulesByCourse(schedules: ScheduleView[]) {
  const grouped = schedules.reduce(
    (acc, schedule) => {
      const key = schedule.course_title || "Corso";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(schedule);
      return acc;
    },
    {} as Record<string, ScheduleView[]>,
  );

  for (const key of Object.keys(grouped)) {
    grouped[key].sort((a, b) => {
      const diff = dayOrder.indexOf(a.day_of_week) - dayOrder.indexOf(b.day_of_week);
      if (diff !== 0) return diff;
      return a.start_time.localeCompare(b.start_time);
    });
  }

  return grouped;
}

export default async function OrariPage() {
  const { data: schedules, error } = await getActiveSchedules();
  const grouped = groupSchedulesByCourse(schedules);

  return (
    <>
      <PagePlaceholder
        title="Orari"
        description="Qui troverai il calendario completo delle lezioni settimanali e degli eventi speciali."
      />
      <Container className="pb-14">
        {error ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">{error}</p>
        ) : schedules.length === 0 ? (
          <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessun orario disponibile al momento.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([courseTitle, items]) => (
              <Card
                key={courseTitle}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <h3 className="mb-4 text-xl font-semibold text-gray-900">{courseTitle}</h3>
                <div className="space-y-3">
                  {items.map((item) => {
                    const teacherRoom = [item.teacher, item.room].filter(Boolean).join(" · ");
                    return (
                      <div key={item.id} className="rounded-xl bg-gray-50 px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {`${formatItalianDay(item.day_of_week)} · ${formatTime(item.start_time)}–${formatTime(item.end_time)}`}
                        </p>
                        {teacherRoom ? (
                          <p className="mt-1 text-sm text-gray-600">{teacherRoom}</p>
                        ) : null}
                        {item.notes ? (
                          <p className="mt-1 text-sm text-gray-500">{item.notes}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}

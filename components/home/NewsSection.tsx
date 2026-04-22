import Link from "next/link";

import { Card } from "@/components/shared/Card";
import { Container } from "@/components/shared/Container";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { getPublishedNews } from "@/lib/supabase/news";
import { formatNewsDate, getNewsContentPreview } from "@/lib/utils/news";

export async function NewsSection() {
  const { data: newsItems, error } = await getPublishedNews(3);

  return (
    <section className="min-w-0 py-10 sm:py-12 md:py-14">
      <Container>
        <SectionTitle title="Ultime news" description="Aggiornamenti su eventi, lezioni speciali e novita della scuola." />
        {error ? (
          <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">{error}</p>
        ) : newsItems.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-border bg-white p-6 text-center text-sm text-gray-700">
            Nessuna novita disponibile al momento.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {newsItems.map((news) => (
              <Card key={news.id} className="flex min-w-0 flex-col overflow-hidden p-0">
                {news.cover_image ? (
                  <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <img src={news.cover_image} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {formatNewsDate(news.published_at) || "-"}
                  </p>
                  <h3 className="mt-2 break-words text-lg font-semibold text-gray-900 sm:text-xl">{news.title}</h3>
                  {news.content.trim() ? (
                    <p className="mt-3 flex-1 text-pretty text-sm text-gray-600">{getNewsContentPreview(news.content)}</p>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-6">
          <Link href="/news" className="text-sm font-semibold text-primary hover:text-violet-700">
            Vai a tutte le news →
          </Link>
        </div>
      </Container>
    </section>
  );
}

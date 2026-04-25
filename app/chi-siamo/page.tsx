import type { Metadata } from "next";

import { Container } from "@/components/shared/Container";
import { getAboutContent } from "@/lib/supabase/chi-siamo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chi siamo | Dance With Me",
  description: "Chi siamo",
};

export default async function ChiSiamoPage() {
  const { data, error } = await getAboutContent();

  if (!data || error) {
    return (
      <Container className="py-12 pb-14">
        <p className="text-gray-700">Contenuto non ancora disponibile.</p>
      </Container>
    );
  }

  return (
    <Container className="pb-14">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">{data.title}</h1>

        <p className="mb-12 text-lg text-gray-500">{data.subtitle ?? ""}</p>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="max-w-xl space-y-4">
            {(data.description ?? "")
              .split(/\n+/)
              .map((block) => block.trim())
              .filter(Boolean)
              .map((block, index) => (
                <p key={index} className="text-base leading-8 text-gray-700 md:text-lg">
                  {block}
                </p>
              ))}
          </div>

          {data.image_url ? (
            <div className="w-full">
              <img
                src={data.image_url}
                alt="Chi siamo"
                className="rounded-xl shadow-lg w-full object-cover"
              />
            </div>
          ) : null}
        </div>

        {data.quote ? (
          <div className="mt-16 text-center md:mt-20">
            <div className="mx-auto mb-4 h-px w-16 bg-gray-300" />
            <p className="text-xl italic text-gray-700 md:text-2xl">&quot;{data.quote}&quot;</p>
          </div>
        ) : null}
      </div>
    </Container>
  );
}

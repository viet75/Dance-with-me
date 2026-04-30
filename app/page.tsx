import { ContactSection } from "@/components/home/ContactSection";
import { EnableNotifications } from "@/components/EnableNotifications";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsSection } from "@/components/home/NewsSection";
import { QuickLinksSection } from "@/components/home/QuickLinksSection";
import { SchedulePreviewSection } from "@/components/home/SchedulePreviewSection";
import { VideosSection } from "@/components/home/VideosSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-w-0 w-full">
      <HeroSection />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative mt-8 mb-8 overflow-hidden rounded-[2rem] border border-white/40 bg-gradient-to-br from-purple-100 via-fuchsia-50 to-white shadow-[0_20px_60px_rgba(124,58,237,0.14)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,180,254,0.35),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(196,181,253,0.28),transparent_38%)]" />

          <div className="relative grid gap-6 px-6 py-8 sm:px-10 sm:py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-purple-200/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-purple-700 backdrop-blur">
                Passione • Eleganza • Energia
              </span>

              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Dove tecnica, emozione e stile si incontrano.
              </h2>

              <p className="max-w-xl text-sm leading-relaxed text-gray-700 sm:text-base">
                Lezioni, percorsi e momenti speciali pensati per chi vuole vivere la danza con qualita, espressione e autenticita.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-[320px] items-center justify-center">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white/50 bg-white/40 p-[6px] shadow-[0_18px_40px_rgba(88,28,135,0.14)] backdrop-blur">
                <img
                  src="/hero-dance.jpg"
                  alt="Dance With Me"
                  className="h-full w-full rounded-[1.4rem] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <EnableNotifications />
      </div>
      <QuickLinksSection />
      <FeaturedCoursesSection />
      <SchedulePreviewSection />
      <NewsSection />
      <VideosSection />
      <GalleryPreview />
      <ContactSection />
    </div>
  );
}

import { ContactSection } from "@/components/home/ContactSection";
import { EnableNotifications } from "@/components/EnableNotifications";
import { FeaturedCoursesSection } from "@/components/home/FeaturedCoursesSection";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsSection } from "@/components/home/NewsSection";
import { QuickLinksSection } from "@/components/home/QuickLinksSection";
import { SchedulePreviewSection } from "@/components/home/SchedulePreviewSection";
import { VideosSection } from "@/components/home/VideosSection";

export default function Home() {
  return (
    <div className="min-w-0 w-full">
      <HeroSection />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
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

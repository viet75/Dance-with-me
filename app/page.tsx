import { ContactSection } from "@/components/home/ContactSection";
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

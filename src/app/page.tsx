import { HeroWall } from "@/components/hero/HeroWall";
import { ScrollFramesSection } from "@/components/scroll-frames/ScrollFramesSection";
import { CraftSection } from "@/components/craft/CraftSection";
import { ContactSection } from "@/components/contact/ContactSection";

export default function HomePage() {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* 1. Hero Wall Gallery with Pop-up Zoom */}
      <HeroWall />

      {/* 2. Scroll-driven 3D Footwear Rotation (188 Frames) */}
      <ScrollFramesSection />

      {/* 3. Craft Section (Two-column with Clip-path Reveal) */}
      <CraftSection />

      {/* 4. Contact & Reservations Section (Boutique list, Map & Reserve Form) */}
      <ContactSection />
    </div>
  );
}

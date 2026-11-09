"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND } from "@/config/brand";

export function CraftSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const imageWrapperRef = useRef<HTMLDivElement | null>(null);
  const textColumnRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const imgEl = imageWrapperRef.current;
    const sectionEl = sectionRef.current;

    if (!imgEl || !sectionEl) return;

    if (isReduced) {
      gsap.set(imgEl, { clipPath: "inset(0% 0% 0% 0%)" });
      return;
    }

    // Reveal once with a gentle clip-path wipe on first scroll into view
    const trigger = gsap.fromTo(
      imgEl,
      {
        clipPath: "inset(100% 0% 0% 0%)",
      },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.35,
        ease: "power3.inOut",
        scrollTrigger: {
          trigger: sectionEl,
          start: "top 72%",
          once: true,
        },
      }
    );

    return () => {
      trigger.scrollTrigger?.kill();
    };
  }, []);

  return (
    <section
      id="craft"
      ref={sectionRef}
      aria-label="Atelier Craft and Shoemaking Principles"
      className="relative w-full bg-background text-foreground py-24 sm:py-32 lg:py-40 transition-colors duration-300 border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
          {/* Column 1: Large Image with Gentle Clip-Path Wipe (5 cols on desktop) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div
              ref={imageWrapperRef}
              className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[736/1000] overflow-hidden rounded-sm bg-background-secondary border border-border transition-all duration-300"
              style={{
                clipPath: "inset(100% 0% 0% 0%)", // Initial state before scroll reveal
                willChange: "clip-path",
              }}
            >
              <Image
                src="/shoes/shoe5.jpeg"
                alt="Maison Aurelle hand-lasted scotch-grain boot"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover object-center select-none"
              />

              {/* Discreet Provenance Label */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-foreground-muted bg-background/80 backdrop-blur-md px-3 py-2 border border-border">
                <span>The Malabar High</span>
                <span>Atelier Mumbai</span>
              </div>
            </div>
          </div>

          {/* Column 2: Left-Aligned Text Column (7 cols on desktop) */}
          <div
            ref={textColumnRef}
            className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center text-left space-y-8"
          >
            {/* Header / Eyebrow */}
            <div className="space-y-4">
              <div className="w-10 h-[1.5px] bg-accent-red" />
              <p className="font-body text-xs uppercase tracking-[0.32em] text-accent-red font-medium">
                Atelier Philosophy
              </p>
              <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.04em] text-foreground leading-[1.15]">
                The discipline of the slow last.
              </h2>
            </div>

            {/* Three Short, Plain Paragraphs */}
            <div className="space-y-5 text-foreground-secondary font-body text-sm sm:text-[15px] font-light leading-relaxed tracking-[0.02em] max-w-xl">
              {/* Paragraph 1: Leather Tanning */}
              <p>
                Our leathers are steeped for forty-five days in oak and mimosa bark extracts.
                We preserve the natural full grain, refusing artificial topcoats, corrected surfaces,
                or synthetic finishes. The hide breathes without resistance in humid climates, softens
                with body heat, and develops an irreplaceable patina across decades of wear.
              </p>

              {/* Paragraph 2: Hand Lasting */}
              <p>
                Every upper is pulled over sculpted beechwood lasts entirely by hand. Rather than
                rushing leather through automated hydraulic crimping machines, our artisans tension the
                substance millimeter by millimeter with lasting pliers, allowing the fibers to rest and
                settle for three full days. The shoe memorizes the natural contours of the human foot without tension.
              </p>

              {/* Paragraph 3: Resoling */}
              <p>
                True cordonnerie is engineered to outlast its first owner. By anchoring the sole with an
                independent welt stitch, the bottom unit can be stripped down, restored, and rebuilt indefinitely
                without disturbing the upper leather or internal cork footbed. What begins as a single pair becomes
                a permanent possession.
              </p>
            </div>

            {/* Row of Three Facts: No Icons, No Cards */}
            <div className="pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 max-w-2xl">
              <div className="space-y-1">
                <span className="block font-headline text-lg sm:text-xl text-foreground font-normal tracking-[0.02em]">
                  Resoleable
                </span>
                <span className="block font-body text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  Hand-stitched welt
                </span>
              </div>

              <div className="space-y-1">
                <span className="block font-headline text-lg sm:text-xl text-foreground font-normal tracking-[0.02em]">
                  Made in small batches
                </span>
                <span className="block font-body text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  Twelve pairs weekly
                </span>
              </div>

              <div className="space-y-1">
                <span className="block font-headline text-lg sm:text-xl text-foreground font-normal tracking-[0.02em]">
                  Two-year care
                </span>
                <span className="block font-body text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  Complimentary upkeep
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

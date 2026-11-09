"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BRAND } from "@/config/brand";

const TOTAL_FRAMES = 188;

interface CaptionData {
  id: string;
  step: string;
  title: string;
  description: string;
  specs: string[];
  range: [number, number]; // [startProgress, endProgress]
}

const CAPTIONS: CaptionData[] = [
  {
    id: "upper",
    step: "01 / ARCHITECTURE",
    title: "Full-Grain Boxcalf Upper",
    description:
      "Hand-selected European calfskin, drum-dyed in organic vegetable extracts. Cut against the natural grain for perpetual structural integrity and deep patina.",
    specs: ["1.6mm substance", "Vegetable-tanned", "Hand-burnished bevel"],
    range: [0.12, 0.38],
  },
  {
    id: "lining",
    step: "02 / ANATOMY",
    title: "Glove-Soft Calfskin Lining",
    description:
      "Zero synthetic backing. An uncompromised, unbroken layer of glove leather breathes naturally in subtropical climates and molds to the unique contours of your foot.",
    specs: ["100% breathable calf", "Cork filler bed", "Antimicrobial insole"],
    range: [0.42, 0.68],
  },
  {
    id: "sole",
    step: "03 / FOUNDATION",
    title: "Goodyear-Welted Sculpted Sole",
    description:
      "Double oak-bark tanned leather outsole channeled by hand and reinforced with vulcanised natural rubber grips. Engineered to be indefinitely resoled.",
    specs: ["360° Goodyear welt", "Recessed stitch channel", "Resoleable for life"],
    range: [0.72, 0.96],
  },
];

export function ScrollFramesSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [loadPercent, setLoadPercent] = useState(0);
  const [frameOneLoaded, setFrameOneLoaded] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [activeCaption, setActiveCaption] = useState<CaptionData | null>(CAPTIONS[0]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentFrameDisplay, setCurrentFrameDisplay] = useState(1);

  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const currentFrameRef = useRef(1);

  // Check reduced motion
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(motionQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    motionQuery.addEventListener("change", handler);
    return () => motionQuery.removeEventListener("change", handler);
  }, []);

  const getFrameUrl = (frameNum: number) => {
    const padded = String(frameNum).padStart(4, "0");
    return `/frames/frame_${padded}.jpg`;
  };

  // Find the closest loaded image so canvas never draws empty
  const getBestAvailableImage = useCallback((targetFrame: number): HTMLImageElement | null => {
    const imgs = imagesRef.current;
    if (!imgs || imgs.length === 0) return null;

    // 1. Direct hit
    const exact = imgs[targetFrame - 1];
    if (exact && exact.complete && exact.naturalWidth > 0) {
      return exact;
    }

    // 2. Search backward
    for (let f = targetFrame - 1; f >= 1; f--) {
      const candidate = imgs[f - 1];
      if (candidate && candidate.complete && candidate.naturalWidth > 0) {
        return candidate;
      }
    }

    // 3. Search forward
    for (let f = targetFrame + 1; f <= TOTAL_FRAMES; f++) {
      const candidate = imgs[f - 1];
      if (candidate && candidate.complete && candidate.naturalWidth > 0) {
        return candidate;
      }
    }

    return null;
  }, []);

  // Render a specific frame on canvas with aspect-ratio containment and DPR capping at 2
  const renderFrame = useCallback((frameNumber: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = getBestAvailableImage(frameNumber);
    if (!img) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const parent = canvas.parentElement;
    const rect = canvas.getBoundingClientRect();

    const displayW = rect.width > 0 ? rect.width : (parent?.clientWidth || 800);
    const displayH = rect.height > 0 ? rect.height : (parent?.clientHeight || 500);

    const targetBufferWidth = Math.round(displayW * dpr);
    const targetBufferHeight = Math.round(displayH * dpr);

    if (canvas.width !== targetBufferWidth || canvas.height !== targetBufferHeight) {
      canvas.width = targetBufferWidth;
      canvas.height = targetBufferHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate aspect ratio containment (1920x1080)
    const imgWidth = img.naturalWidth || 1920;
    const imgHeight = img.naturalHeight || 1080;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvas.width / canvas.height;

    let drawW = canvas.width;
    let drawH = canvas.height;

    if (canvasRatio > imgRatio) {
      drawH = canvas.height * 0.94;
      drawW = drawH * imgRatio;
    } else {
      drawW = canvas.width * 0.96;
      drawH = drawW / imgRatio;
    }

    const drawX = (canvas.width - drawW) / 2;
    const drawY = (canvas.height - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  }, [getBestAvailableImage]);

  // Preload frames progressively
  useEffect(() => {
    if (reducedMotion) return;

    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    imagesRef.current = images;

    let loadedCount = 0;

    // Load Frame 1 FIRST and immediately render it
    const frameOne = new window.Image();
    frameOne.src = getFrameUrl(1);
    frameOne.onload = () => {
      images[0] = frameOne;
      loadedCount++;
      setLoadPercent(Math.round((loadedCount / TOTAL_FRAMES) * 100));
      setFrameOneLoaded(true);
      renderFrame(1);
    };

    // Load remaining frames progressively
    for (let i = 2; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        images[i - 1] = img;
        loadedCount++;
        const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        setLoadPercent(pct);
        if (loadedCount >= TOTAL_FRAMES) {
          setAllLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
      };
    }

    return () => {
      imagesRef.current = [];
    };
  }, [reducedMotion, renderFrame]);

  // Initial draw once mounted and on resize
  useEffect(() => {
    const handleResize = () => {
      renderFrame(currentFrameRef.current);
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    const timeout = setTimeout(() => {
      renderFrame(currentFrameRef.current);
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, [renderFrame]);

  // Setup GSAP ScrollTrigger Pinned Animation
  useEffect(() => {
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const pinnedEl = pinnedRef.current;
    if (!container || !pinnedEl) return;

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: pinnedEl,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: 0.35, // Smooth inertia scrub
      onUpdate: (self) => {
        const progress = self.progress;
        setScrollProgress(progress);

        // Map progress [0, 1] to frame index [1, 188]
        const frameIndex = Math.min(
          Math.max(Math.round(progress * (TOTAL_FRAMES - 1)) + 1, 1),
          TOTAL_FRAMES
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          setCurrentFrameDisplay(frameIndex);
          renderFrame(frameIndex);
        }

        // Active caption matching
        const matched = CAPTIONS.find(
          (c) => progress >= c.range[0] && progress <= c.range[1]
        );
        setActiveCaption(matched || null);
      },
    });

    // Refresh ScrollTrigger after a tick so container geometry is exact
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);

    return () => {
      clearTimeout(refreshTimer);
      trigger.kill();
    };
  }, [reducedMotion, renderFrame]);

  // Reduced motion fallback view
  if (reducedMotion) {
    return (
      <section
        aria-label="3D Footwear Craft Analysis"
        className="w-full bg-[#080809] text-white py-24 sm:py-32 px-6 sm:px-12 border-b border-white/[0.08]"
      >
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-12 h-[1.5px] bg-accent-red mx-auto mb-5" />
            <p className="font-body text-xs uppercase tracking-[0.3em] text-white/50 mb-2">
              Bespoke Deconstruction
            </p>
            <h2 className="font-headline text-3xl sm:text-5xl font-light tracking-[0.04em]">
              The Anatomy of Aurelle
            </h2>
          </div>

          <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src="/frames/still.jpg"
              alt="Maison Aurelle Hand-welted Footwear Still"
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 90vw, 75vw"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-white/[0.08]">
            {CAPTIONS.map((cap) => (
              <div key={cap.id} className="space-y-3">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-accent-red">
                  {cap.step}
                </span>
                <h3 className="font-headline text-xl text-white font-normal">
                  {cap.title}
                </h3>
                <p className="font-body text-xs text-white/70 leading-relaxed font-light">
                  {cap.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {cap.specs.map((spec) => (
                    <span
                      key={spec}
                      className="text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded border border-white/15 text-white/60"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      aria-label="3D Footwear Rotation"
      className="relative w-full h-[320vh] bg-[#070708] text-white border-b border-white/[0.08]"
    >
      {/* Pinned Viewport Container (GSAP ScrollTrigger Pinned) */}
      <div
        ref={pinnedRef}
        className="w-full h-screen flex flex-col justify-between overflow-hidden bg-[#070708] relative"
      >
        {/* Atmospheric Ambient Lighting */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.045)_0%,rgba(161,26,31,0.03)_40%,transparent_75%)] blur-3xl" />
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#070708] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#070708] to-transparent pointer-events-none z-10" />
        </div>

        {/* Quiet Loading State: Sleek Top-Right Badge */}
        {!allLoaded && (
          <div className="absolute top-6 right-6 sm:right-12 z-30 flex items-center gap-2.5 bg-white/[0.06] backdrop-blur-md border border-white/10 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse" />
            <span>Preloading 3D Frames: {loadPercent}%</span>
          </div>
        )}

        {/* Top Header Information Bar */}
        <header className="relative z-20 w-full px-6 sm:px-12 pt-6 sm:pt-8 flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/50 border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
            <span className="text-white font-medium">360° Footwear Deconstruction</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-[10px] text-white/40">
            <span>Scroll smoothly to rotate</span>
            <span>•</span>
            <span>1920 × 1080 Native Resolution</span>
          </div>

          <div className="font-body text-xs text-white/70 tracking-[0.15em] font-mono">
            {String(currentFrameDisplay).padStart(3, "0")} / {TOTAL_FRAMES}
          </div>
        </header>

        {/* Center Canvas Stage & Beside-the-Shoe Captions */}
        <div className="relative z-10 flex-1 w-full flex items-center justify-center px-4 sm:px-8">
          {/* Base Fallback Image for Instant Zero-Delay Appearance */}
          {!frameOneLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Image
                src="/frames/frame_0001.jpg"
                alt="3D Footwear Preview"
                width={1920}
                height={1080}
                priority
                className="max-h-[72vh] w-auto object-contain select-none opacity-50"
              />
            </div>
          )}

          {/* High-DPI Interactive Canvas */}
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="w-full h-full max-h-[72vh] object-contain select-none pointer-events-none"
          />

          {/* Beside-the-Shoe Captions (Desktop: Right Side; Mobile: Bottom Floating Card) */}
          <div className="pointer-events-none absolute inset-x-6 sm:inset-x-12 bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 flex justify-start sm:justify-end z-20">
            <div className="w-full sm:max-w-sm">
              {CAPTIONS.map((cap) => {
                const isSelected = activeCaption?.id === cap.id;
                return (
                  <div
                    key={cap.id}
                    className={`transition-all duration-500 ease-out bg-[#0D0D10]/90 backdrop-blur-md border border-white/15 rounded-lg p-5 sm:p-6 shadow-2xl shadow-black/80 space-y-3 ${
                      isSelected
                        ? "opacity-100 translate-y-0 pointer-events-auto block"
                        : "opacity-0 translate-y-4 pointer-events-none hidden sm:block sm:absolute sm:inset-x-0"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                      <span className="font-body text-[10px] uppercase tracking-[0.28em] text-accent-red font-medium">
                        {cap.step}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                        Atelier Focus
                      </span>
                    </div>

                    <h3 className="font-headline text-xl sm:text-2xl text-white font-normal tracking-[0.03em] leading-snug">
                      {cap.title}
                    </h3>

                    <p className="font-body text-xs text-white/75 font-light leading-relaxed tracking-[0.03em]">
                      {cap.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {cap.specs.map((s) => (
                        <span
                          key={s}
                          className="text-[9px] uppercase tracking-[0.16em] px-2 py-0.5 rounded border border-white/15 bg-white/[0.03] text-white/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Progress Bar & Step Dots */}
        <footer className="relative z-20 w-full px-6 sm:px-12 pb-6 sm:pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
          {/* Step markers */}
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-[0.22em] text-white/50">
            {CAPTIONS.map((cap) => {
              const active = activeCaption?.id === cap.id;
              return (
                <div
                  key={cap.id}
                  className={`flex items-center gap-2 transition-colors duration-300 ${
                    active ? "text-amber-300 font-medium" : "text-white/40"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      active ? "bg-amber-400 scale-125" : "bg-white/20"
                    }`}
                  />
                  <span>{cap.id.toUpperCase()}</span>
                </div>
              );
            })}
          </div>

          {/* Thin scroll line indicator */}
          <div className="w-full sm:w-64 flex items-center gap-3">
            <span className="text-[10px] text-white/40 tracking-[0.15em] uppercase">
              Rotation
            </span>
            <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-red transition-all duration-75"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-white/40 font-mono">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          <div className="hidden lg:block text-[10px] uppercase tracking-[0.2em] text-white/40">
            {BRAND.name} Atelier Mumbai
          </div>
        </footer>
      </div>
    </section>
  );
}

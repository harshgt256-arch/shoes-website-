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
    step: "I · ARCHITECTURE",
    title: "Full-Grain Boxcalf Upper",
    description: "1.6mm European calfskin drum-dyed in organic vegetable extracts. Cut against the grain for lifelong shape retention.",
    specs: ["1.6mm European Boxcalf", "Vegetable-Tanned", "Hand-Burnished Bevel"],
    range: [0.12, 0.38],
  },
  {
    id: "lining",
    step: "II · ANATOMY",
    title: "Glove-Soft Calfskin Lining",
    description: "Zero synthetic backing. An unbroken layer of breathable glove leather that molds to your foot.",
    specs: ["100% Breathable Calf", "Natural Cork Filler", "Antimicrobial Bed"],
    range: [0.42, 0.68],
  },
  {
    id: "sole",
    step: "III · FOUNDATION",
    title: "Goodyear-Welted Sculpted Sole",
    description: "Double oak-bark tanned leather outsole channeled by hand with recessed stitch channel.",
    specs: ["360° Goodyear Welt", "Recessed Stitching", "Indefinitely Resoleable"],
    range: [0.72, 0.96],
  },
];

export function ScrollFramesSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [overrideReducedMotion, setOverrideReducedMotion] = useState(false);
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
  const renderFrame = useCallback(
    (frameNumber: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = getBestAvailableImage(frameNumber);
      if (!img) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      const rect = canvas.getBoundingClientRect();

      const displayW = rect.width > 0 ? rect.width : (parent?.clientWidth || 360);
      const displayH = rect.height > 0 ? rect.height : (parent?.clientHeight || 450);

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
        drawH = canvas.height * 0.90;
        drawW = drawH * imgRatio;
      } else {
        drawW = canvas.width * 0.95;
        drawH = drawW / imgRatio;
      }

      const drawX = (canvas.width - drawW) / 2;
      // On mobile portrait, gently shift shoe upward so floating text sits cleanly below
      const isPortrait = canvasRatio < 1;
      const verticalShift = isPortrait ? -Math.round((canvas.height - drawH) * 0.16) : 0;
      const drawY = Math.max(0, (canvas.height - drawH) / 2 + verticalShift);

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    },
    [getBestAvailableImage]
  );

  // Progressive 3-phase frame preloader
  useEffect(() => {
    if (reducedMotion && !overrideReducedMotion) return;

    const images: (HTMLImageElement | null)[] = new Array(TOTAL_FRAMES).fill(null);
    imagesRef.current = images;

    let loadedCount = 0;
    let isCancelled = false;

    const loadSingleFrame = (frameNum: number): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        if (images[frameNum - 1]?.complete) {
          return resolve(images[frameNum - 1]);
        }
        const img = new window.Image();
        img.src = getFrameUrl(frameNum);
        img.onload = () => {
          if (isCancelled) return resolve(null);
          images[frameNum - 1] = img;
          loadedCount++;
          const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          setLoadPercent(pct);
          if (frameNum === 1 || !frameOneLoaded) {
            setFrameOneLoaded(true);
            renderFrame(currentFrameRef.current);
          }
          resolve(img);
        };
        img.onerror = () => {
          loadedCount++;
          resolve(null);
        };
      });
    };

    const KEYFRAMES = [1, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144, 156, 168, 180, 188];

    const PHASE_2_FRAMES: number[] = [];
    for (let f = 4; f <= TOTAL_FRAMES; f += 4) {
      if (!KEYFRAMES.includes(f)) {
        PHASE_2_FRAMES.push(f);
      }
    }

    const PHASE_3_FRAMES: number[] = [];
    for (let f = 1; f <= TOTAL_FRAMES; f++) {
      if (!KEYFRAMES.includes(f) && !PHASE_2_FRAMES.includes(f)) {
        PHASE_3_FRAMES.push(f);
      }
    }

    const executePreload = async () => {
      await loadSingleFrame(1);
      if (isCancelled) return;
      renderFrame(1);

      await Promise.all(KEYFRAMES.map((f) => loadSingleFrame(f)));
      if (isCancelled) return;
      renderFrame(currentFrameRef.current);
      ScrollTrigger.refresh();

      for (let i = 0; i < PHASE_2_FRAMES.length; i += 6) {
        if (isCancelled) return;
        const batch = PHASE_2_FRAMES.slice(i, i + 6);
        await Promise.all(batch.map((f) => loadSingleFrame(f)));
      }

      for (let i = 0; i < PHASE_3_FRAMES.length; i += 8) {
        if (isCancelled) return;
        const batch = PHASE_3_FRAMES.slice(i, i + 8);
        await Promise.all(batch.map((f) => loadSingleFrame(f)));
      }

      if (!isCancelled) {
        setAllLoaded(true);
      }
    };

    executePreload();

    return () => {
      isCancelled = true;
      imagesRef.current = [];
    };
  }, [reducedMotion, overrideReducedMotion, renderFrame]);

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
    if (reducedMotion && !overrideReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const pinnedEl = pinnedRef.current;
    if (!container || !pinnedEl) return;

    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    const trigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: pinnedEl,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: isTouch ? 0.08 : 0.35,
      onUpdate: (self) => {
        const progress = self.progress;
        setScrollProgress(progress);

        const frameIndex = Math.min(
          Math.max(Math.round(progress * (TOTAL_FRAMES - 1)) + 1, 1),
          TOTAL_FRAMES
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          setCurrentFrameDisplay(frameIndex);
          renderFrame(frameIndex);
        }

        const matched = CAPTIONS.find(
          (c) => progress >= c.range[0] && progress <= c.range[1]
        );
        setActiveCaption(matched || null);
      },
    });

    const handleNativeScroll = () => {
      ScrollTrigger.update();
    };
    window.addEventListener("scroll", handleNativeScroll, { passive: true });

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      renderFrame(currentFrameRef.current);
    }, 250);

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener("scroll", handleNativeScroll);
      trigger.kill();
    };
  }, [reducedMotion, overrideReducedMotion, renderFrame]);

  // Reduced motion fallback view with manual override
  if (reducedMotion && !overrideReducedMotion) {
    return (
      <section
        aria-label="3D Footwear Craft Analysis"
        className="w-full bg-[#080809] text-white py-20 sm:py-32 px-6 sm:px-12 border-b border-white/[0.08]"
      >
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-12 h-[1.5px] bg-accent-red mx-auto mb-5" />
            <p className="font-body text-xs uppercase tracking-[0.3em] text-white/50 mb-2">
              Bespoke Deconstruction
            </p>
            <h2 className="font-headline text-3xl sm:text-5xl font-light tracking-[0.04em]">
              The Anatomy of Aurelle
            </h2>
            <div className="mt-4 flex flex-col items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.16em] text-white/40">
                Reduced motion is active on your device
              </span>
              <button
                type="button"
                onClick={() => setOverrideReducedMotion(true)}
                className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-300/40 bg-amber-400/10 text-amber-200 text-xs uppercase tracking-[0.18em] hover:bg-amber-400/20 active:scale-95 transition-all"
              >
                <span>Play 360° Interactive Rotation</span>
                <span className="text-amber-300 font-bold">→</span>
              </button>
            </div>
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
              <div key={cap.id} className="space-y-2 text-center sm:text-left">
                <span className="font-body text-[10px] uppercase tracking-[0.25em] text-accent-red font-medium">
                  {cap.step}
                </span>
                <h3 className="font-headline text-xl text-white font-normal">
                  {cap.title}
                </h3>
                <p className="font-body text-xs text-white/70 leading-relaxed font-light">
                  {cap.description}
                </p>
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
      className="relative w-full h-[320vh] bg-[#070708] text-white border-b border-white/[0.06]"
    >
      {/* Pinned Viewport Container (GSAP ScrollTrigger Pinned) */}
      <div
        ref={pinnedRef}
        className="w-full h-screen h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#070708] relative"
      >
        {/* Ambient Gallery Pedestal Lighting */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        >
          {/* Subtle warm pedestal glow directly under the shoe */}
          <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[350px] sm:h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,rgba(217,119,6,0.025)_40%,transparent_70%)] blur-2xl" />
          <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#070708] to-transparent pointer-events-none z-10" />
          <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#070708] to-transparent pointer-events-none z-10" />
        </div>

        {/* Minimal Preload Pill (only until keyframes ready) */}
        {!allLoaded && (
          <div className="absolute top-4 right-4 sm:top-6 sm:right-12 z-30 flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-full px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse" />
            <span>360° Cache: {loadPercent}%</span>
          </div>
        )}

        {/* Minimal Slim Top Header */}
        <header className="relative z-20 w-full px-5 sm:px-12 pt-5 sm:pt-7 flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-white/40">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
            <span className="text-white/90 font-light tracking-[0.22em]">360° Studio Deconstruction</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] text-white/35 tracking-[0.25em]">
            <span>Scroll to Rotate</span>
            <span>•</span>
            <span>Handmade Boxcalf Silhouette</span>
          </div>

          <div className="font-body text-[11px] text-white/60 tracking-[0.18em] font-mono">
            {String(currentFrameDisplay).padStart(3, "0")} / {TOTAL_FRAMES}
          </div>
        </header>

        {/* Center Stage: 100% Unobstructed Shoe Display */}
        <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-4 sm:px-12">
          {/* Base Fallback Image */}
          {!frameOneLoaded && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Image
                src="/frames/frame_0001.jpg"
                alt="3D Footwear Preview"
                width={1920}
                height={1080}
                priority
                className="max-h-[64vh] w-auto object-contain select-none opacity-40"
              />
            </div>
          )}

          {/* High-DPI 3D Rotating Canvas */}
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="w-full h-full max-h-[64vh] sm:max-h-[68vh] object-contain select-none pointer-events-none"
          />

          {/* Pure Editorial Caption (Zero bulky boxes - Pure Typography) */}
          <div className="pointer-events-none absolute inset-x-6 sm:inset-x-12 bottom-2 sm:bottom-6 flex flex-col items-center text-center z-20">
            {CAPTIONS.map((cap) => {
              const isSelected = activeCaption?.id === cap.id;
              return (
                <div
                  key={cap.id}
                  className={`transition-all duration-500 ease-out max-w-xl mx-auto space-y-1 sm:space-y-1.5 ${
                    isSelected
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 absolute pointer-events-none"
                  }`}
                >
                  <span className="font-body text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-accent-red font-medium block">
                    {cap.step}
                  </span>

                  <h3 className="font-headline text-xl sm:text-3xl text-white font-light tracking-[0.03em]">
                    {cap.title}
                  </h3>

                  <p className="font-body text-[11px] sm:text-xs text-white/60 font-light leading-relaxed tracking-[0.02em] max-w-md mx-auto hidden sm:block">
                    {cap.description}
                  </p>

                  {/* Refined Specs String separated by elegant mid-dots */}
                  <p className="font-body text-[10px] sm:text-[11px] text-white/45 uppercase tracking-[0.18em] pt-0.5">
                    {cap.specs.join("  ·  ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Bottom Bar: Step Dots & Progress Line */}
        <footer className="relative z-20 w-full px-5 sm:px-12 pb-4 sm:pb-6 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-3.5">
          {/* Step markers */}
          <div className="flex items-center gap-4 sm:gap-8 text-[9px] sm:text-[10px] uppercase tracking-[0.24em] text-white/45">
            {CAPTIONS.map((cap) => {
              const active = activeCaption?.id === cap.id;
              return (
                <div
                  key={cap.id}
                  className={`flex items-center gap-2 transition-colors duration-300 ${
                    active ? "text-white font-medium" : "text-white/30"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      active ? "bg-accent-red scale-125" : "bg-white/20"
                    }`}
                  />
                  <span>{cap.id.toUpperCase()}</span>
                </div>
              );
            })}
          </div>

          {/* Hairline rotation progress indicator */}
          <div className="w-28 sm:w-48 flex items-center gap-3">
            <div className="flex-1 h-[1.5px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-red transition-all duration-75"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] text-white/40 font-mono">
              {Math.round(scrollProgress * 100)}%
            </span>
          </div>

          <div className="hidden lg:block text-[10px] uppercase tracking-[0.24em] text-white/35">
            Mumbai Atelier · Limited Batches
          </div>
        </footer>
      </div>
    </section>
  );
}

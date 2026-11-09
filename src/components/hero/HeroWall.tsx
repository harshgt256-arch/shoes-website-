"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SHOES, ShoeProduct } from "@/data/shoes";
import { formatINR } from "@/config/brand";
import { ShoeDetailPanel } from "./ShoeDetailPanel";
import { ArrowUpRight } from "lucide-react";

export function HeroWall() {
  const [activeHoverId, setActiveHoverId] = useState<string | null>(null);
  const [selectedShoe, setSelectedShoe] = useState<ShoeProduct | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const selectedShoeRef = useRef<ShoeProduct | null>(null);
  selectedShoeRef.current = selectedShoe;

  // DOM Refs
  const sectionRef = useRef<HTMLElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const viewingAreaRef = useRef<HTMLDivElement | null>(null);
  const detailPanelContainerRef = useRef<HTMLDivElement | null>(null);
  const footnoteRef = useRef<HTMLDivElement | null>(null);

  // Per-shoe elements
  const shoeItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shoeCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shoeShelfRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shoeImageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Check reduced motion
  const checkReducedMotion = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Zoom In Function
  const zoomIn = useCallback((shoe: ShoeProduct) => {
    if (isAnimating) return;
    const shoeIndex = SHOES.findIndex((s) => s.id === shoe.id);
    if (shoeIndex === -1) return;

    const shoeCard = shoeCardRefs.current[shoeIndex];
    const viewingArea = viewingAreaRef.current;
    if (!shoeCard || !viewingArea) return;

    setIsAnimating(true);
    setSelectedShoe(shoe);
    setIsZoomed(true);

    const isReduced = checkReducedMotion();
    const duration = isReduced ? 0.01 : 0.9; // 900ms

    // Ensure viewing area and detail panel containers are visible for layout
    if (detailPanelContainerRef.current) {
      detailPanelContainerRef.current.style.pointerEvents = "auto";
    }

    // Measure exact bounding boxes with getBoundingClientRect
    const viewingRect = viewingArea.getBoundingClientRect();
    const shoeRect = shoeCard.getBoundingClientRect();

    const targetCenterX = viewingRect.left + viewingRect.width / 2;
    const targetCenterY = viewingRect.top + viewingRect.height / 2;
    const currentCenterX = shoeRect.left + shoeRect.width / 2;
    const currentCenterY = shoeRect.top + shoeRect.height / 2;

    const deltaX = targetCenterX - currentCenterX;
    const deltaY = targetCenterY - currentCenterY;

    // Calculate scale factor relative to viewing area
    const availableWidth = Math.min(viewingRect.width * 0.72, 420);
    const targetScale = Math.min(Math.max(availableWidth / shoeRect.width, 1.5), 2.4);

    // Keep amber glow active under chosen shoe
    const shelf = shoeShelfRefs.current[shoeIndex];
    if (shelf) {
      shelf.classList.add("shelf-amber-active");
    }

    // Elevate chosen shoe wrapper
    const shoeItem = shoeItemRefs.current[shoeIndex];
    if (shoeItem) {
      shoeItem.style.zIndex = "45";
    }

    // Set cursor on zoomed shoe to normal default
    shoeCard.classList.add("cursor-default");
    shoeCard.classList.remove("cursor-pointer");

    // Gather all other shoe items
    const otherItems = shoeItemRefs.current.filter((_, idx) => idx !== shoeIndex);

    // Build timeline
    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        // Sync URL hash
        if (window.location.hash !== `#${shoe.id}`) {
          window.location.hash = shoe.id;
        }
      },
    });

    // 1. Fade & blur other shoes
    tl.to(
      otherItems,
      {
        opacity: 0,
        filter: "blur(12px)",
        scale: 0.96,
        duration: duration * 0.9,
        ease: "power3.inOut",
        pointerEvents: "none",
      },
      0
    );

    // 2. Fade out headline and footnote
    if (headlineRef.current) {
      tl.to(
        headlineRef.current,
        {
          opacity: 0,
          y: -25,
          duration: duration * 0.6,
          ease: "power2.inOut",
        },
        0
      );
    }
    if (footnoteRef.current) {
      tl.to(
        footnoteRef.current,
        {
          opacity: 0,
          duration: duration * 0.5,
          ease: "power2.inOut",
        },
        0
      );
    }

    // 3. Move and scale chosen shoe to exact center of viewing area
    tl.to(
      shoeCard,
      {
        x: deltaX,
        y: deltaY,
        scale: targetScale,
        duration: duration,
        ease: "power3.inOut",
      },
      0
    );

    // 4. Slide in right detail panel
    if (detailPanelContainerRef.current) {
      tl.fromTo(
        detailPanelContainerRef.current,
        {
          opacity: 0,
          x: 40,
        },
        {
          opacity: 1,
          x: 0,
          duration: duration * 0.85,
          ease: "power3.out",
        },
        duration * 0.2
      );
    }
  }, [checkReducedMotion, isAnimating]);

  // Zoom Out Function
  const zoomOut = useCallback(() => {
    if (isAnimating || !selectedShoeRef.current) return;
    const currentShoe = selectedShoeRef.current;
    const shoeIndex = SHOES.findIndex((s) => s.id === currentShoe.id);
    if (shoeIndex === -1) return;

    const shoeCard = shoeCardRefs.current[shoeIndex];
    if (!shoeCard) return;

    setIsAnimating(true);
    const isReduced = checkReducedMotion();
    const duration = isReduced ? 0.01 : 0.9; // 900ms

    if (detailPanelContainerRef.current) {
      detailPanelContainerRef.current.style.pointerEvents = "none";
    }

    const otherItems = shoeItemRefs.current.filter((_, idx) => idx !== shoeIndex);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsAnimating(false);
        setIsZoomed(false);
        setSelectedShoe(null);

        // Reset z-index and amber shelf
        const shoeItem = shoeItemRefs.current[shoeIndex];
        if (shoeItem) {
          shoeItem.style.zIndex = "";
        }
        const shelf = shoeShelfRefs.current[shoeIndex];
        if (shelf) {
          shelf.classList.remove("shelf-amber-active");
        }

        shoeCard.classList.remove("cursor-default");
        shoeCard.classList.add("cursor-pointer");

        // Clear URL hash without jumping the page
        if (window.location.hash) {
          history.pushState(
            null,
            "",
            window.location.pathname + window.location.search
          );
        }
      },
    });

    // 1. Fade out right detail panel
    if (detailPanelContainerRef.current) {
      tl.to(
        detailPanelContainerRef.current,
        {
          opacity: 0,
          x: 35,
          duration: duration * 0.5,
          ease: "power2.inOut",
        },
        0
      );
    }

    // 2. Animate chosen shoe back to full wall position
    tl.to(
      shoeCard,
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: duration,
        ease: "power3.inOut",
      },
      0
    );

    // 3. Restore all other shoes
    tl.to(
      otherItems,
      {
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        duration: duration * 0.95,
        ease: "power3.inOut",
        pointerEvents: "auto",
      },
      duration * 0.1
    );

    // 4. Restore headline and footnote
    if (headlineRef.current) {
      tl.to(
        headlineRef.current,
        {
          opacity: 1,
          y: 0,
          duration: duration * 0.7,
          ease: "power2.out",
        },
        duration * 0.2
      );
    }
    if (footnoteRef.current) {
      tl.to(
        footnoteRef.current,
        {
          opacity: 1,
          duration: duration * 0.6,
          ease: "power2.out",
        },
        duration * 0.3
      );
    }
  }, [checkReducedMotion, isAnimating]);

  // Pan to another shoe while remaining zoomed
  const panToShoe = useCallback(
    (nextShoe: ShoeProduct, direction: "next" | "prev" = "next") => {
      if (isAnimating || !selectedShoeRef.current) return;
      const oldIndex = SHOES.findIndex((s) => s.id === selectedShoeRef.current?.id);
      const newIndex = SHOES.findIndex((s) => s.id === nextShoe.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const oldCard = shoeCardRefs.current[oldIndex];
      const newCard = shoeCardRefs.current[newIndex];
      const viewingArea = viewingAreaRef.current;
      if (!oldCard || !newCard || !viewingArea) return;

      setIsAnimating(true);
      const isReduced = checkReducedMotion();

      // Update URL hash
      window.location.hash = nextShoe.id;

      if (isReduced) {
        // Immediate switch for reduced motion
        const oldShelf = shoeShelfRefs.current[oldIndex];
        const newShelf = shoeShelfRefs.current[newIndex];
        if (oldShelf) oldShelf.classList.remove("shelf-amber-active");
        if (newShelf) newShelf.classList.add("shelf-amber-active");

        const oldItem = shoeItemRefs.current[oldIndex];
        const newItem = shoeItemRefs.current[newIndex];
        if (oldItem) oldItem.style.zIndex = "";
        if (newItem) newItem.style.zIndex = "45";

        gsap.set(oldCard, { x: 0, y: 0, scale: 1 });
        const viewingRect = viewingArea.getBoundingClientRect();
        const newRect = newCard.getBoundingClientRect();
        const deltaX = viewingRect.left + viewingRect.width / 2 - (newRect.left + newRect.width / 2);
        const deltaY = viewingRect.top + viewingRect.height / 2 - (newRect.top + newRect.height / 2);
        const targetScale = Math.min(Math.max((viewingRect.width * 0.72) / newRect.width, 1.5), 2.4);
        gsap.set(newCard, { x: deltaX, y: deltaY, scale: targetScale });

        setSelectedShoe(nextShoe);
        setIsAnimating(false);
        return;
      }

      // Pan animation with light motion blur
      const isForward = direction === "next";
      const oldImage = shoeImageRefs.current[oldIndex];
      const newImage = shoeImageRefs.current[newIndex];
      const oldShelf = shoeShelfRefs.current[oldIndex];
      const newShelf = shoeShelfRefs.current[newIndex];

      const viewingRect = viewingArea.getBoundingClientRect();
      const newRect = newCard.getBoundingClientRect();
      const deltaX = viewingRect.left + viewingRect.width / 2 - (newRect.left + newRect.width / 2);
      const deltaY = viewingRect.top + viewingRect.height / 2 - (newRect.top + newRect.height / 2);
      const targetScale = Math.min(Math.max((viewingRect.width * 0.72) / newRect.width, 1.5), 2.4);

      const oldItem = shoeItemRefs.current[oldIndex];
      const newItem = shoeItemRefs.current[newIndex];

      const tl = gsap.timeline({
        onComplete: () => {
          if (oldShelf) oldShelf.classList.remove("shelf-amber-active");
          if (oldItem) oldItem.style.zIndex = "";
          gsap.set(oldCard, { x: 0, y: 0, scale: 1 });
          if (oldImage) gsap.set(oldImage, { x: 0, filter: "blur(0px)", opacity: 1 });

          setSelectedShoe(nextShoe);
          setIsAnimating(false);
        },
      });

      // 1. Pan current shoe sideways with light motion blur
      if (oldImage) {
        tl.to(oldImage, {
          x: isForward ? -75 : 75,
          filter: "blur(8px)",
          opacity: 0.15,
          duration: 0.32,
          ease: "power2.in",
        });
      }

      // 2. Position new shoe directly at viewing area and bring in from opposite side
      tl.add(() => {
        if (newItem) newItem.style.zIndex = "45";
        if (newShelf) newShelf.classList.add("shelf-amber-active");
        gsap.set(newCard, { x: deltaX, y: deltaY, scale: targetScale });
        if (newImage) {
          gsap.set(newImage, {
            x: isForward ? 75 : -75,
            filter: "blur(8px)",
            opacity: 0.15,
          });
        }
      });

      if (newImage) {
        tl.to(newImage, {
          x: 0,
          filter: "blur(0px)",
          opacity: 1,
          duration: 0.38,
          ease: "power2.out",
        });
      }
    },
    [checkReducedMotion, isAnimating]
  );

  // Handle URL hash & back/forward button
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").trim();
      if (!hash) {
        if (selectedShoeRef.current) {
          zoomOut();
        }
        return;
      }

      const match = SHOES.find((s) => s.id === hash || s.slug === hash);
      if (match) {
        if (selectedShoeRef.current?.id === match.id) return;
        if (selectedShoeRef.current) {
          panToShoe(match, "next");
        } else {
          zoomIn(match);
        }
      }
    };

    // Check initial hash after mount
    const timer = setTimeout(handleHash, 250);
    window.addEventListener("popstate", handleHash);
    window.addEventListener("hashchange", handleHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("popstate", handleHash);
      window.removeEventListener("hashchange", handleHash);
    };
  }, [panToShoe, zoomIn, zoomOut]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedShoeRef.current) {
        e.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoomOut]);

  // Click on shoe item
  const handleShoeClick = (shoe: ShoeProduct) => {
    if (isZoomed && selectedShoe?.id === shoe.id) {
      // "Clicking the shoe again zooms out"
      zoomOut();
    } else if (!isZoomed) {
      zoomIn(shoe);
    }
  };

  const currentIndex = selectedShoe
    ? SHOES.findIndex((s) => s.id === selectedShoe.id)
    : 0;

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + SHOES.length) % SHOES.length;
    panToShoe(SHOES[prevIndex], "prev");
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % SHOES.length;
    panToShoe(SHOES[nextIndex], "next");
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Hero Gallery Wall"
      className="relative min-h-[90vh] w-full bg-[#080809] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-b border-white/[0.08] flex flex-col justify-center"
    >
      {/* Gallery Wall Lighting & Atmospheric Spotlights */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* Overhead primary spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08)_0%,rgba(245,158,11,0.03)_40%,transparent_75%)] blur-2xl" />

        {/* Ambient spotlight for Upper Tier (Row 1) */}
        <div className="hidden md:block absolute top-[36%] left-1/2 -translate-x-1/2 w-[1300px] h-[260px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035)_0%,rgba(245,158,11,0.02)_50%,transparent_80%)] blur-xl" />

        {/* Ambient spotlight for Lower Tier (Row 2) */}
        <div className="hidden md:block absolute top-[68%] left-1/2 -translate-x-1/2 w-[1300px] h-[260px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.035)_0%,rgba(245,158,11,0.02)_50%,transparent_80%)] blur-xl" />

        {/* Subtle architectural wall vertical vignette */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080809] to-transparent opacity-80" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080809] to-transparent opacity-80" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 lg:px-12">
        {/* Headline Section */}
        <div ref={headlineRef} className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 lg:mb-20">
          <div className="w-12 h-[1.5px] bg-accent-red mx-auto mb-6" />
          <p className="font-body text-[11px] sm:text-xs uppercase tracking-[0.34em] text-white/50 mb-3.5">
            Atelier Permanent Collection
          </p>
          <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl text-white font-light tracking-[0.05em] leading-[1.12]">
            Made slowly. Worn for years.
          </h1>
          <p className="font-body text-xs sm:text-sm text-white/60 tracking-[0.08em] mt-4 font-light max-w-md mx-auto">
            Ten silhouettes crafted from full-grain leathers, hand-welted in our Mumbai atelier.
          </p>
        </div>

        {/* Viewing Target Stage & Right Detail Container (Used during Zoom-In) */}
        <div
          className={`absolute inset-x-3 sm:inset-x-8 lg:inset-x-12 top-2 sm:top-6 bottom-2 sm:bottom-6 z-30 pointer-events-none flex flex-col lg:flex-row items-center justify-between transition-opacity duration-300 overflow-y-auto lg:overflow-visible ${
            isZoomed ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Exact Viewing Area for Centering the Chosen Shoe (Left ~60% on desktop) */}
          <div
            ref={viewingAreaRef}
            className="w-full lg:w-[60%] h-[42vh] lg:h-full flex items-center justify-center relative pointer-events-none"
          />

          {/* Right Detail Panel Container */}
          <div
            ref={detailPanelContainerRef}
            className="w-full lg:w-[40%] flex items-center justify-center lg:justify-end py-2 pointer-events-none opacity-0"
          >
            {selectedShoe && (
              <ShoeDetailPanel
                shoe={selectedShoe}
                currentIndex={currentIndex}
                totalShoes={SHOES.length}
                onPrev={handlePrev}
                onNext={handleNext}
                onClose={zoomOut}
              />
            )}
          </div>
        </div>

        {/* The 10-Shoe Gallery Wall: 2 rows of 5 on desktop, 2 columns on mobile */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 md:grid-cols-5 gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-12 sm:gap-y-16 lg:gap-y-20 relative"
        >
          {SHOES.map((shoe, index) => {
            const floatDelay = `${((index % 5) * 0.85 + (index >= 5 ? 0.42 : 0)).toFixed(2)}s`;
            const isHovered = activeHoverId === shoe.id;
            const isCurrentSelected = selectedShoe?.id === shoe.id;

            return (
              <div
                key={shoe.id}
                ref={(el) => {
                  shoeItemRefs.current[index] = el;
                }}
                className="group relative flex flex-col items-center justify-end"
              >
                {/* Shoe Card Wrapper (Transformed with GSAP on Zoom) */}
                <div
                  ref={(el) => {
                    shoeCardRefs.current[index] = el;
                  }}
                  onClick={() => handleShoeClick(shoe)}
                  className={`w-full flex flex-col items-center will-change-transform ${
                    isCurrentSelected ? "cursor-default" : "cursor-pointer"
                  }`}
                  style={{ transformOrigin: "center center" }}
                >
                  {/* Floating Shoe Visual Area */}
                  <div className="relative w-full h-[140px] sm:h-[165px] lg:h-[185px] flex items-end justify-center pb-1">
                    {/* Hover Lift: rises 6px when full wall is active */}
                    <div
                      className={`w-full h-full flex items-end justify-center transition-transform duration-300 ease-out ${
                        !isZoomed
                          ? "group-hover:-translate-y-[6px] group-focus-within:-translate-y-[6px]"
                          : ""
                      }`}
                    >
                      {/* Idle float layer (disabled when zoomed to maintain exact center) */}
                      <div
                        className={`w-full h-full flex items-end justify-center ${
                          !isZoomed ? "animate-idle-float" : ""
                        }`}
                        style={{
                          animationDelay: floatDelay,
                          animationDuration: "4.8s",
                        }}
                      >
                        {/* Shoe Image Container (Pan with motion blur during prev/next) */}
                        <div
                          ref={(el) => {
                            shoeImageRefs.current[index] = el;
                          }}
                          className="relative w-full h-full flex items-end justify-center will-change-transform"
                        >
                          <Image
                            src={shoe.image}
                            alt={`${shoe.name} in ${shoe.colour}`}
                            width={736}
                            height={Math.round(736 / shoe.aspectRatio)}
                            quality={95}
                            priority={index < 5}
                            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 26vw, 18vw"
                            className="max-h-[125px] sm:max-h-[150px] lg:max-h-[170px] w-auto object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] select-none pointer-events-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* "Click to inspect" Tooltip (only when wall is not zoomed) */}
                    {!isZoomed && (
                      <div
                        className={`pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-200 border border-amber-300/30 shadow-lg shadow-black/40 transition-all duration-300 ${
                          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                        }`}
                      >
                        <span>Click to inspect</span>
                        <ArrowUpRight className="h-3 w-3 stroke-[2]" />
                      </div>
                    )}
                  </div>

                  {/* Thin Glass Shelf (amber glow stays under shoe) */}
                  <div className="relative w-full max-w-[200px] sm:max-w-[220px] mx-auto mt-0.5 mb-3.5">
                    <div
                      ref={(el) => {
                        shoeShelfRefs.current[index] = el;
                      }}
                      className="glass-shelf h-[2.5px] w-full rounded-full"
                    />
                  </div>
                </div>

                {/* Keyboard accessible trigger & Label */}
                <button
                  type="button"
                  onClick={() => handleShoeClick(shoe)}
                  onFocus={() => setActiveHoverId(shoe.id)}
                  onBlur={() => setActiveHoverId(null)}
                  onMouseEnter={() => setActiveHoverId(shoe.id)}
                  onMouseLeave={() => setActiveHoverId(null)}
                  disabled={isZoomed && !isCurrentSelected}
                  className={`w-full text-center px-1 space-y-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/80 rounded-sm p-1 transition-opacity duration-300 ${
                    isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                  aria-label={`Inspect ${shoe.name}, in ${shoe.colour}. Price: ${formatINR(shoe.price)}`}
                >
                  <h3 className="font-headline text-sm sm:text-base font-normal tracking-[0.04em] text-white transition-colors duration-200 group-hover:text-amber-200">
                    {shoe.name}
                  </h3>
                  <p className="font-body text-[11px] uppercase tracking-[0.18em] text-white/50">
                    {shoe.colour}
                  </p>
                  <p className="font-body text-xs tracking-[0.08em] text-white/90 font-medium pt-0.5">
                    {formatINR(shoe.price)}
                  </p>
                </button>
              </div>
            );
          })}
        </div>

        {/* Atelier Quality Footnote */}
        <div
          ref={footnoteRef}
          className="mt-16 sm:mt-20 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/40 gap-4"
        >
          <span>All ten silhouettes hand-lasted in Mumbai</span>
          <span>Sizes: UK / India 6 to 12 • Standard & Bespoke Widths</span>
          <span>Prices inclusive of 18% GST</span>
        </div>
      </div>
    </section>
  );
}

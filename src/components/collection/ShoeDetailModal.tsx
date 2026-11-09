"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ShoeProduct, SHOES } from "@/data/shoes";
import { ShoeDetailPanel } from "@/components/hero/ShoeDetailPanel";

interface ShoeDetailModalProps {
  shoe: ShoeProduct | null;
  onClose: () => void;
  onSelectShoe: (shoe: ShoeProduct) => void;
}

export function ShoeDetailModal({ shoe, onClose, onSelectShoe }: ShoeDetailModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Animate modal appearance
  useEffect(() => {
    if (!shoe) return;

    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = isReduced ? 0.01 : 0.65;

    if (modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0 },
        { opacity: 1, duration: duration * 0.5, ease: "power2.out" }
      );
    }

    if (imageRef.current) {
      gsap.fromTo(
        imageRef.current,
        { scale: 0.88, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration, ease: "power3.out" }
      );
    }

    if (panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: duration * 0.9, ease: "power3.out" }
      );
    }
  }, [shoe]);

  // Handle previous & next with light motion blur
  const handlePan = useCallback(
    (direction: "prev" | "next") => {
      if (!shoe || isPanning) return;
      setIsPanning(true);

      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const currentIndex = SHOES.findIndex((s) => s.id === shoe.id);
      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % SHOES.length
          : (currentIndex - 1 + SHOES.length) % SHOES.length;
      const nextShoe = SHOES[nextIndex];

      if (isReduced || !imageRef.current) {
        onSelectShoe(nextShoe);
        window.location.hash = nextShoe.id;
        setIsPanning(false);
        return;
      }

      const imgEl = imageRef.current;
      const isNext = direction === "next";

      const tl = gsap.timeline({
        onComplete: () => {
          onSelectShoe(nextShoe);
          window.location.hash = nextShoe.id;
          gsap.fromTo(
            imgEl,
            { x: isNext ? 60 : -60, filter: "blur(8px)", opacity: 0.2 },
            {
              x: 0,
              filter: "blur(0px)",
              opacity: 1,
              duration: 0.35,
              ease: "power2.out",
              onComplete: () => setIsPanning(false),
            }
          );
        },
      });

      tl.to(imgEl, {
        x: isNext ? -60 : 60,
        filter: "blur(8px)",
        opacity: 0.2,
        duration: 0.28,
        ease: "power2.in",
      });
    },
    [isPanning, onSelectShoe, shoe]
  );

  if (!shoe) return null;

  const currentIndex = SHOES.findIndex((s) => s.id === shoe.id);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Inspect ${shoe.name}`}
      className="fixed inset-0 z-50 flex items-start lg:items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 lg:p-12 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left: Centered Shoe in Viewing Area with Amber Glow Shelf */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-10 relative">
          <div
            ref={imageRef}
            className="relative w-full max-w-lg aspect-square flex flex-col items-center justify-center cursor-default"
          >
            {/* The Shoe Image */}
            <div className="relative w-full h-[220px] sm:h-[300px] lg:h-[360px] flex items-end justify-center pb-2">
              <Image
                src={shoe.image}
                alt={`${shoe.name} in ${shoe.colour}`}
                width={736}
                height={Math.round(736 / shoe.aspectRatio)}
                quality={95}
                priority
                sizes="(max-width: 1024px) 80vw, 45vw"
                className="max-h-full w-auto object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] select-none"
              />
            </div>

            {/* Glowing Amber Glass Shelf */}
            <div className="relative w-full max-w-[280px] sm:max-w-[340px] mt-1">
              <div className="glass-shelf shelf-amber-active h-[3px] w-full rounded-full" />
            </div>

            <p className="font-body text-[10px] uppercase tracking-[0.22em] text-white/40 mt-4">
              Hand-finished in Mumbai Atelier
            </p>
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div ref={panelRef} className="lg:col-span-5 flex justify-center">
          <ShoeDetailPanel
            shoe={shoe}
            currentIndex={currentIndex}
            totalShoes={SHOES.length}
            onPrev={() => handlePan("prev")}
            onNext={() => handlePan("next")}
            onClose={onClose}
          />
        </div>
      </div>
    </div>
  );
}

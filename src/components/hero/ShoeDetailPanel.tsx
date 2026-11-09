"use client";

import React, { useState } from "react";
import { ShoeProduct } from "@/data/shoes";
import { BRAND, formatINR } from "@/config/brand";
import { ChevronLeft, ChevronRight, X, Check, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ShoeDetailPanelProps {
  shoe: ShoeProduct;
  currentIndex: number;
  totalShoes: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onAddToCart?: (shoe: ShoeProduct, size: number) => void;
  onReserve?: (shoe: ShoeProduct, size: number) => void;
}

export function ShoeDetailPanel({
  shoe,
  currentIndex,
  totalShoes,
  onPrev,
  onNext,
  onClose,
  onAddToCart,
  onReserve,
}: ShoeDetailPanelProps) {
  const [selectedSize, setSelectedSize] = useState<number>(8);
  const [addedToast, setAddedToast] = useState(false);
  const [reservedToast, setReservedToast] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(shoe, selectedSize, 1);
    setAddedToast(true);
    if (onAddToCart) {
      onAddToCart(shoe, selectedSize);
    }
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleReserve = () => {
    setReservedToast(true);
    if (onReserve) {
      onReserve(shoe, selectedSize);
    }
    setTimeout(() => setReservedToast(false), 2800);
  };

  return (
    <div className="relative flex flex-col justify-between h-full w-full max-w-md mx-auto text-white p-5 sm:p-7 lg:p-9 bg-[#0C0C0E]/95 backdrop-blur-2xl border border-white/[0.1] rounded-sm shadow-2xl shadow-black/80">
      {/* Top Bar: Model Index, Close Button */}
      <div className="flex items-center justify-between pb-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
          <span className="font-body text-[11px] uppercase tracking-[0.26em] text-white/50">
            Silhouette {String(currentIndex + 1).padStart(2, "0")} / {String(totalShoes).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail view (or press Escape)"
          className="group flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
          title="Close (Esc)"
        >
          <X className="h-4 w-4 stroke-[1.8] transition-transform duration-200 group-hover:rotate-90" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="py-5 space-y-5 flex-1 overflow-y-auto pr-1">
        {/* Model Name in Bodoni Moda */}
        <div className="space-y-1">
          <p className="font-body text-[10px] uppercase tracking-[0.24em] text-white/40">
            {shoe.category} • {shoe.colour}
          </p>
          <h2 className="font-headline text-2xl sm:text-3xl font-light tracking-[0.03em] text-white leading-tight">
            {shoe.name}
          </h2>
        </div>

        {/* One-line Description */}
        <p className="font-body text-xs text-white/65 font-light leading-relaxed tracking-[0.02em]">
          {shoe.description}
        </p>

        {/* Price with Indian Currency Grouping */}
        <div className="pt-3 pb-2.5 border-y border-white/[0.06] flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-headline text-2xl text-white tracking-[0.02em]">
              {formatINR(shoe.price)}
            </div>
            <p className="font-body text-[10px] uppercase tracking-[0.12em] text-white/50 mt-0.5">
              {BRAND.commerce.gstInclusiveLabel}
            </p>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-white/15 text-white/60">
            Hand-welted
          </span>
        </div>

        {/* Minimalist Inline Size Selector (UK 6 to 12) */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-baseline text-xs">
            <span className="font-body uppercase tracking-[0.22em] text-white/70 text-[10px] font-medium">
              Select Size ({BRAND.commerce.sizeStandard})
            </span>
            <span className="text-[10px] text-amber-300/80 tracking-[0.14em]">
              UK {selectedSize} · In Stock
            </span>
          </div>

          {/* Clean Horizontal Grid of Sizes */}
          <div className="grid grid-cols-7 gap-1.5">
            {BRAND.commerce.shoeSizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`h-10 flex flex-col items-center justify-center rounded-sm transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
                    isSelected
                      ? "bg-white text-black font-semibold shadow-md shadow-white/10 ring-1 ring-white"
                      : "bg-white/[0.04] text-white/75 border border-white/10 hover:border-white/35 hover:bg-white/[0.08]"
                  }`}
                  aria-label={`Select UK size ${size}`}
                  aria-pressed={isSelected}
                >
                  <span className="font-body text-xs font-medium">{size}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-white/40 tracking-[0.08em] pt-0.5">
            <span>Fits true to standard UK / Indian sizing</span>
            <span className="text-white/60 underline cursor-default">Free Exchanges</span>
          </div>
        </div>

        {/* Action Buttons: Add to cart & Reserve a pair */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full relative flex items-center justify-center gap-2 py-3.5 px-6 rounded-sm bg-white text-black font-body text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-200 hover:bg-amber-300 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.99]"
          >
            {addedToast ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                <span>Added to Bag (UK {selectedSize})</span>
              </>
            ) : (
              <span>Add to Bag &bull; {formatINR(shoe.price)}</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReserve}
            className="w-full relative flex items-center justify-center gap-2 py-3 px-6 rounded-sm border border-white/25 bg-transparent text-white/90 font-body text-[11px] uppercase tracking-[0.2em] font-medium transition-all duration-200 hover:border-accent-red hover:text-accent-red hover:bg-accent-red/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red active:scale-[0.99]"
          >
            {reservedToast ? (
              <>
                <Check className="h-4 w-4 text-accent-red stroke-[2.5]" />
                <span>Reservation Requested</span>
              </>
            ) : (
              <span>Reserve Pair for Atelier Fitting</span>
            )}
          </button>
        </div>

        {/* Trust & Guarantee Notes */}
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-white/[0.06] text-[10px] text-white/45 tracking-[0.06em]">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-white/40 shrink-0" />
            <span>Complimentary insured shipping in India</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-white/40 shrink-0" />
            <span>Lifetime resoling & care program</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Prev / Next Navigation Arrows */}
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous shoe"
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60 hover:text-amber-300 transition-colors py-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 group-hover:border-amber-300 transition-colors">
            <ChevronLeft className="h-3.5 w-3.5 stroke-[1.8]" />
          </div>
          <span className="hidden sm:inline text-[11px]">Previous</span>
        </button>

        <span className="text-[10px] uppercase tracking-[0.22em] text-white/35">
          Browse Silhouettes
        </span>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next shoe"
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/60 hover:text-amber-300 transition-colors py-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
        >
          <span className="hidden sm:inline text-[11px]">Next</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 group-hover:border-amber-300 transition-colors">
            <ChevronRight className="h-3.5 w-3.5 stroke-[1.8]" />
          </div>
        </button>
      </div>
    </div>
  );
}

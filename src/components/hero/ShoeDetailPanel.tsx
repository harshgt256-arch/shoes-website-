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
    <div className="relative flex flex-col justify-between h-full w-full max-w-md mx-auto text-white p-5 sm:p-8 lg:p-10 bg-[#0C0C0E]/95 backdrop-blur-xl border border-white/[0.12] rounded-lg shadow-2xl shadow-black/80">
      {/* Top Bar: Model Count, Close Button */}
      <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <span className="font-body text-[11px] uppercase tracking-[0.28em] text-accent-red font-medium">
            Atelier Silhouette
          </span>
          <span className="text-white/30 text-xs">•</span>
          <span className="font-body text-xs tracking-[0.15em] text-white/50">
            {String(currentIndex + 1).padStart(2, "0")} / {String(totalShoes).padStart(2, "0")}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close detail view (or press Escape)"
          className="group flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
          title="Close (Esc)"
        >
          <X className="h-4 w-4 stroke-[1.8] transition-transform duration-200 group-hover:rotate-90" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="py-6 space-y-6 flex-1 overflow-y-auto pr-1">
        {/* Model Name in Bodoni Moda */}
        <div className="space-y-1.5">
          <p className="font-body text-[10px] uppercase tracking-[0.25em] text-white/40">
            {shoe.category} • {shoe.colour}
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl font-normal tracking-[0.04em] text-white leading-tight">
            {shoe.name}
          </h2>
        </div>

        {/* One-line Description */}
        <p className="font-body text-xs sm:text-sm text-white/70 font-light leading-relaxed tracking-[0.03em]">
          {shoe.description}
        </p>

        {/* Price in ₹ with Indian Grouping */}
        <div className="pt-3 pb-2 border-y border-white/[0.08] flex flex-wrap items-baseline justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="font-headline text-2xl sm:text-3xl text-white tracking-[0.02em] break-words">
              {formatINR(shoe.price)}
            </div>
            <p className="font-body text-[10px] uppercase tracking-[0.14em] text-white/60 mt-1 leading-relaxed break-words">
              {BRAND.commerce.gstInclusiveLabel}
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.18em] px-2.5 py-0.5 rounded border border-white/20 text-white/70 shrink-0 self-start">
            Handmade
          </span>
        </div>

        {/* Size Dropdown (UK/India 6 to 12) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="shoe-size-select" className="font-body uppercase tracking-[0.18em] text-white/70 text-[11px]">
              Select Size ({BRAND.commerce.sizeStandard})
            </label>
            <span className="text-[10px] text-white/40 tracking-[0.1em]">
              True to Indian fit
            </span>
          </div>

          <div className="relative">
            <select
              id="shoe-size-select"
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              className="w-full appearance-none bg-white/[0.06] border border-white/20 rounded px-4 py-3 text-xs uppercase tracking-[0.15em] text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors cursor-pointer"
            >
              {BRAND.commerce.shoeSizes.map((size) => (
                <option key={size} value={size} className="bg-[#141416] text-white">
                  UK / India {size} &nbsp;—&nbsp; In Atelier Stock
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-white/50">
              <ChevronRight className="h-4 w-4 rotate-90 stroke-[1.5]" />
            </div>
          </div>
        </div>

        {/* Action Buttons: Add to cart & Reserve a pair */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full relative flex items-center justify-center gap-2 py-3.5 px-6 rounded bg-white text-black font-body text-xs uppercase tracking-[0.22em] font-semibold transition-all duration-200 hover:bg-amber-300 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {addedToast ? (
              <>
                <Check className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                <span>Added to Bag (UK/IND {selectedSize})</span>
              </>
            ) : (
              <span>Add to Cart &bull; {formatINR(shoe.price)}</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReserve}
            className="w-full relative flex items-center justify-center gap-2 py-3.5 px-6 rounded border border-white/30 bg-transparent text-white font-body text-xs uppercase tracking-[0.22em] font-medium transition-all duration-200 hover:border-accent-red hover:text-accent-red hover:bg-accent-red/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
          >
            {reservedToast ? (
              <>
                <Check className="h-4 w-4 text-accent-red stroke-[2.5]" />
                <span>Reservation Requested</span>
              </>
            ) : (
              <span>Reserve a Pair for Atelier Fitting</span>
            )}
          </button>
        </div>

        {/* Quiet Provenance & Trust Notes */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08] text-[10px] text-white/50 tracking-[0.08em]">
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
      <div className="flex items-center justify-between pt-5 border-t border-white/[0.08]">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous shoe"
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70 hover:text-amber-300 transition-colors py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 group-hover:border-amber-300 transition-colors">
            <ChevronLeft className="h-4 w-4 stroke-[1.8]" />
          </div>
          <span className="hidden sm:inline">Previous</span>
        </button>

        <span className="text-[11px] uppercase tracking-[0.2em] text-white/40">
          Pan gallery
        </span>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next shoe"
          className="group flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-white/70 hover:text-amber-300 transition-colors py-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400"
        >
          <span className="hidden sm:inline">Next</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 group-hover:border-amber-300 transition-colors">
            <ChevronRight className="h-4 w-4 stroke-[1.8]" />
          </div>
        </button>
      </div>
    </div>
  );
}

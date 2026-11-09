"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { SHOES, ShoeProduct, ShoeCategory } from "@/data/shoes";
import { formatINR, BRAND } from "@/config/brand";
import { ShoeDetailModal } from "./ShoeDetailModal";
import { SlidersHorizontal, ArrowUpDown, X, ArrowUpRight } from "lucide-react";

type SortOption = "featured" | "price-asc" | "price-desc";
type PriceFilter = "all" | "under-28k" | "28k-32k" | "above-32k";

const CATEGORIES: { label: string; value: "All" | ShoeCategory }[] = [
  { label: "All Silhouettes", value: "All" },
  { label: "Sneakers", value: "Sneakers" },
  { label: "Loafers", value: "Loafers" },
  { label: "Boots", value: "Boots" },
];

const PRICE_TIERS: { label: string; value: PriceFilter }[] = [
  { label: "All Price Ranges", value: "all" },
  { label: "Under ₹28,000", value: "under-28k" },
  { label: "₹28,000 – ₹32,000", value: "28k-32k" },
  { label: "Above ₹32,000", value: "above-32k" },
];

// Color mapping for leather swatches
const getLeatherColor = (colour: string) => {
  const c = colour.toLowerCase();
  if (c.includes("black") || c.includes("noir")) return "#1c1c1e";
  if (c.includes("oxblood") || c.includes("burgundy") || c.includes("cherry")) return "#6b2026";
  if (c.includes("tan") || c.includes("cognac")) return "#a66838";
  if (c.includes("espresso") || c.includes("brown") || c.includes("chocolate")) return "#3d2817";
  if (c.includes("white") || c.includes("chalk") || c.includes("ivory")) return "#e8e6df";
  if (c.includes("slate") || c.includes("grey") || c.includes("gray")) return "#58595b";
  if (c.includes("navy") || c.includes("blue")) return "#1b2838";
  return "#2c2c2e";
};

export function CollectionClient() {
  const [selectedCategory, setSelectedCategory] = useState<"All" | ShoeCategory>("All");
  const [selectedSort, setSelectedSort] = useState<SortOption>("featured");
  const [selectedPriceTier, setSelectedPriceTier] = useState<PriceFilter>("all");
  const [activeShoe, setActiveShoe] = useState<ShoeProduct | null>(null);

  // Deep linking via URL hash on mount or hash change
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "").trim();
      if (!hash) {
        setActiveShoe(null);
        return;
      }
      const match = SHOES.find((s) => s.id === hash || s.slug === hash);
      if (match) {
        setActiveShoe(match);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("popstate", handleHash);

    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("popstate", handleHash);
    };
  }, []);

  const handleOpenDetail = (shoe: ShoeProduct) => {
    setActiveShoe(shoe);
    window.location.hash = shoe.id;
  };

  const handleCloseDetail = () => {
    setActiveShoe(null);
    if (window.location.hash) {
      history.pushState(null, "", window.location.pathname + window.location.search);
    }
  };

  // Filter & Sort Logic
  const filteredShoes = useMemo(() => {
    let result = [...SHOES];

    // 1. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((shoe) => shoe.type === selectedCategory);
    }

    // 2. Price Filter
    if (selectedPriceTier === "under-28k") {
      result = result.filter((shoe) => shoe.price < 28000);
    } else if (selectedPriceTier === "28k-32k") {
      result = result.filter((shoe) => shoe.price >= 28000 && shoe.price <= 32000);
    } else if (selectedPriceTier === "above-32k") {
      result = result.filter((shoe) => shoe.price > 32000);
    }

    // 3. Sort
    if (selectedSort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, selectedPriceTier, selectedSort]);

  // Compute smart empty state message
  const getEmptyStateMessage = () => {
    const categoryName =
      selectedCategory === "All" ? "silhouettes" : selectedCategory.toLowerCase();

    if (selectedPriceTier !== "all") {
      return {
        title: `No ${categoryName} in this price range.`,
        advice: "Clear the price filter to view all available atelier pairs.",
        action: "Clear the price filter",
        onAction: () => setSelectedPriceTier("all"),
      };
    }

    return {
      title: `No ${categoryName} currently available.`,
      advice: "Reset your category filters to browse our complete collection.",
      action: "Clear all filters",
      onAction: () => {
        setSelectedCategory("All");
        setSelectedPriceTier("all");
      },
    };
  };

  const emptyState = getEmptyStateMessage();

  return (
    <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300 pb-32">
      {/* Header Banner */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-6 sm:px-8 lg:px-12 border-b border-border bg-background-secondary/40">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-4 max-w-3xl">
            <div className="w-10 h-[1.5px] bg-accent-red" />
            <p className="font-body text-xs uppercase tracking-[0.34em] text-accent-red font-medium">
              Permanent Roster
            </p>
            <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-light tracking-[0.04em] leading-[1.12]">
              The Aurelle Collection
            </h1>
            <p className="font-body text-xs sm:text-sm text-foreground-secondary font-light max-w-xl leading-relaxed tracking-wide">
              Ten archival silhouettes handcrafted in our Mumbai atelier. Every pair Goodyear-welted or Blake-stitched in limited weekly batches.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Chips Bar & Sort Dropdowns */}
      <section className="sticky top-[57px] z-30 bg-background/90 backdrop-blur-md border-b border-border py-4 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-[0.18em] transition-all duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red ${
                    isActive
                      ? "bg-foreground text-background font-medium shadow-sm"
                      : "bg-background-secondary/80 text-foreground-secondary hover:text-foreground border border-border"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Controls: Price Range & Sort Options */}
          <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto">
            {/* Price Filter Selector */}
            <div className="relative flex-1 md:flex-initial">
              <label htmlFor="price-tier-select" className="sr-only">
                Filter by Price
              </label>
              <select
                id="price-tier-select"
                value={selectedPriceTier}
                onChange={(e) => setSelectedPriceTier(e.target.value as PriceFilter)}
                className="w-full appearance-none bg-background-secondary/80 border border-border rounded-full pl-4 pr-9 py-2 text-xs uppercase tracking-[0.14em] text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red cursor-pointer"
              >
                {PRICE_TIERS.map((tier) => (
                  <option key={tier.value} value={tier.value} className="bg-background text-foreground">
                    {tier.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-foreground-muted">
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Price Sort Selector */}
            <div className="relative flex-1 md:flex-initial">
              <label htmlFor="sort-select" className="sr-only">
                Sort Collection
              </label>
              <select
                id="sort-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as SortOption)}
                className="w-full appearance-none bg-background-secondary/80 border border-border rounded-full pl-4 pr-9 py-2 text-xs uppercase tracking-[0.14em] text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red cursor-pointer"
              >
                <option value="featured" className="bg-background text-foreground">
                  Sort: Featured
                </option>
                <option value="price-asc" className="bg-background text-foreground">
                  Sort: Price: Low to High
                </option>
                <option value="price-desc" className="bg-background text-foreground">
                  Sort: Price: High to Low
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-foreground-muted">
                <ArrowUpDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: 3 columns on desktop, 2 on mobile */}
      <main className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-12">
        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground-muted mb-8 pb-3 border-b border-border/50">
          <span>
            Displaying {filteredShoes.length} of {SHOES.length} silhouettes
          </span>
          {(selectedCategory !== "All" || selectedPriceTier !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedPriceTier("all");
              }}
              className="flex items-center gap-1.5 text-accent-red hover:underline text-[11px]"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Empty State Handler */}
        {filteredShoes.length === 0 ? (
          <div
            role="status"
            className="py-24 px-6 text-center max-w-md mx-auto space-y-5 animate-fadeIn"
          >
            <div className="w-10 h-[1.5px] bg-accent-red mx-auto mb-2" />
            <h2 className="font-headline text-2xl sm:text-3xl text-foreground font-normal">
              {emptyState.title}
            </h2>
            <p className="font-body text-xs sm:text-sm text-foreground-secondary leading-relaxed tracking-wide font-light">
              {emptyState.advice}
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={emptyState.onAction}
                className="py-3 px-6 rounded-full bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-accent-red hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red"
              >
                {emptyState.action}
              </button>
            </div>
          </div>
        ) : (
          /* The Collection Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 transition-all duration-300">
            {filteredShoes.map((shoe) => (
              <article
                key={shoe.id}
                className="group flex flex-col justify-between transition-all duration-300"
              >
                {/* Interactive Card Trigger opening Detail View */}
                <button
                  type="button"
                  onClick={() => handleOpenDetail(shoe)}
                  className="w-full text-left flex flex-col focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red rounded-sm group"
                  aria-label={`Inspect ${shoe.name}, in ${shoe.colour}. Price: ${formatINR(shoe.price)}`}
                >
                  {/* Centered Shoe Framing Container */}
                  <div className="relative w-full aspect-[4/3] sm:aspect-square flex items-center justify-center p-6 sm:p-8 bg-background-secondary/60 rounded-sm border border-border/80 transition-all duration-300 group-hover:border-accent-red/40 group-hover:bg-background-secondary overflow-hidden">
                    {/* Hover lift on image */}
                    <div className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105">
                      <Image
                        src={shoe.image}
                        alt={`${shoe.name} in ${shoe.colour}`}
                        width={736}
                        height={Math.round(736 / shoe.aspectRatio)}
                        quality={95}
                        sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 24vw"
                        className="max-h-[82%] w-auto object-contain object-center drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_14px_22px_rgba(0,0,0,0.65)] select-none pointer-events-none"
                      />
                    </div>

                    {/* Subtle Amber Glow Shelf */}
                    <div className="absolute bottom-4 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-border to-transparent opacity-60 group-hover:via-amber-400 group-hover:opacity-100 transition-all duration-300" />

                    {/* Quick Inspect Arrow Hint */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-foreground-muted">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Name, Leather Swatch, and Price */}
                  <div className="pt-3.5 pb-1 space-y-1.5 text-left">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full border border-black/20 dark:border-white/20 shrink-0"
                        style={{ backgroundColor: getLeatherColor(shoe.colour) }}
                        aria-hidden="true"
                      />
                      <p className="font-body text-[10px] uppercase tracking-[0.22em] text-foreground-muted">
                        {shoe.type} · {shoe.colour}
                      </p>
                    </div>

                    <h2 className="font-headline text-base sm:text-lg text-foreground font-light tracking-[0.03em] group-hover:text-accent-red transition-colors">
                      {shoe.name}
                    </h2>

                    <div className="flex flex-wrap items-baseline justify-between gap-1 pt-0.5">
                      <span className="font-body text-xs sm:text-sm text-foreground font-medium tracking-[0.04em] break-words">
                        {formatINR(shoe.price)}
                      </span>
                      <span className="text-[10px] text-foreground-muted uppercase tracking-[0.14em] shrink-0">
                        {BRAND.commerce.gstInclusiveLabel}
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Shared Detail Modal from Prompt 3 */}
      <ShoeDetailModal
        shoe={activeShoe}
        onClose={handleCloseDetail}
        onSelectShoe={(next) => setActiveShoe(next)}
      />
    </div>
  );
}

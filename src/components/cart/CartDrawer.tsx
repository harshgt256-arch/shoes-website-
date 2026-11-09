"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatINR, BRAND } from "@/config/brand";
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
    gstAmount,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsCartOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
    >
      <div
        ref={drawerRef}
        className="relative w-full max-w-md h-full bg-background border-l border-border flex flex-col justify-between shadow-2xl transition-transform duration-300 animate-slideInRight"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-4 w-4 text-accent-red" />
            <h2 className="font-headline text-lg text-foreground font-normal tracking-[0.04em]">
              Shopping Bag
            </h2>
            <span className="font-body text-xs text-foreground-muted">
              ({totalItems} {totalItems === 1 ? "pair" : "pairs"})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
            aria-label="Close cart drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Item List / Empty State */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
              <div className="w-12 h-12 rounded-full bg-background-secondary flex items-center justify-center text-foreground-muted border border-border">
                <ShoppingBag className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-headline text-xl text-foreground font-normal">
                  Your bag is empty
                </h3>
                <p className="font-body text-xs text-foreground-muted max-w-xs leading-relaxed">
                  Discover our permanent collection of ten handcrafted silhouettes.
                </p>
              </div>
              <Link
                href="/collection"
                onClick={() => setIsCartOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-xs uppercase tracking-[0.18em] font-medium hover:bg-accent-red hover:text-white transition-colors"
              >
                <span>Explore Collection</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.shoeId}-${item.size}`}
                className="flex gap-4 pb-6 border-b border-border/60 last:border-0"
              >
                {/* Product Thumbnail */}
                <div className="relative w-20 h-20 bg-background-secondary rounded border border-border/80 flex items-center justify-center shrink-0 p-1.5 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="max-h-full w-auto object-contain object-center drop-shadow-sm select-none"
                  />
                </div>

                {/* Details & Controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-headline text-sm text-foreground font-normal">
                        {item.name}
                      </h4>
                      <p className="font-body text-[11px] text-foreground-muted uppercase tracking-[0.14em]">
                        {item.category} • UK/IND {item.size}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.shoeId, item.size)}
                      className="text-foreground-muted hover:text-accent-red transition-colors p-1"
                      aria-label={`Remove ${item.name} size ${item.size} from bag`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border rounded">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.shoeId, item.size, item.quantity - 1)
                        }
                        className="px-2 py-0.5 text-foreground-muted hover:text-foreground transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2.5 text-xs font-mono font-medium text-foreground">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.shoeId, item.size, item.quantity + 1)
                        }
                        className="px-2 py-0.5 text-foreground-muted hover:text-foreground transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="font-body text-xs font-semibold text-foreground tracking-wide">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Subtotal & Checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 bg-background-secondary/40 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-foreground">
                <span className="font-body uppercase tracking-[0.16em] text-[11px]">
                  Subtotal
                </span>
                <span className="font-headline text-base font-medium">
                  {formatINR(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-foreground-muted text-[11px]">
                <span>18% GST (Included)</span>
                <span>{formatINR(gstAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-foreground-muted text-[11px]">
                <span>Insured White-Glove Shipping</span>
                <span className="text-emerald-600 font-medium uppercase tracking-[0.1em]">
                  Complimentary
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded bg-foreground text-background font-body text-xs uppercase tracking-[0.22em] font-semibold transition-colors hover:bg-accent-red hover:text-white"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-foreground-muted uppercase tracking-[0.14em]">
              <ShieldCheck className="h-3 w-3 text-accent-red" />
              <span>Complimentary Returns & Two-Year Atelier Care</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

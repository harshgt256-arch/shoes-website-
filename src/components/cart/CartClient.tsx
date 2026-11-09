"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/config/brand";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from "lucide-react";

export function CartClient() {
  const { items, removeItem, updateQuantity, subtotal, gstAmount, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24 space-y-4">
        <div className="w-14 h-14 rounded-full bg-background-secondary border border-border flex items-center justify-center text-foreground-muted">
          <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
        </div>
        <h1 className="font-headline text-3xl text-foreground font-normal">
          Your shopping bag is empty
        </h1>
        <p className="font-body text-xs text-foreground-muted max-w-sm leading-relaxed">
          Explore our permanent roster of ten handcrafted silhouettes.
        </p>
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 px-6 py-3 rounded bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-accent-red hover:text-white transition-colors"
        >
          <span>Explore Collection</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground py-20 sm:py-28 px-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="space-y-2 border-b border-border pb-6">
          <h1 className="font-headline text-3xl sm:text-4xl font-light tracking-[0.04em]">
            Shopping Bag
          </h1>
          <p className="font-body text-xs text-foreground-muted tracking-wide">
            {items.length} {items.length === 1 ? "silhouette" : "silhouettes"} queued for atelier crafting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <div
                key={`${item.shoeId}-${item.size}`}
                className="flex gap-4 pb-6 border-b border-border"
              >
                <div className="relative w-24 h-24 bg-background-secondary rounded border border-border flex items-center justify-center shrink-0 p-2">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="max-h-full w-auto object-contain"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-headline text-lg text-foreground font-normal">
                        {item.name}
                      </h2>
                      <p className="font-body text-xs text-foreground-muted uppercase tracking-wider">
                        {item.category} • UK/IND {item.size} • {item.colour}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.shoeId, item.size)}
                      className="text-foreground-muted hover:text-accent-red p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-3">
                    <div className="flex items-center border border-border rounded">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.shoeId, item.size, item.quantity - 1)
                        }
                        className="px-2.5 py-1 text-foreground-muted hover:text-foreground"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-3 text-xs font-mono font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.shoeId, item.size, item.quantity + 1)
                        }
                        className="px-2.5 py-1 text-foreground-muted hover:text-foreground"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-body text-sm font-semibold text-foreground">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:col-span-4 bg-background-secondary/50 border border-border p-6 rounded space-y-5 h-fit">
            <h2 className="font-headline text-lg text-foreground font-normal border-b border-border pb-3">
              Order Subtotal
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-foreground-secondary">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>18% GST (Included)</span>
                <span>{formatINR(gstAmount)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted">
                <span>Insured Domestic Courier</span>
                <span className="text-emerald-600 font-medium uppercase tracking-wider">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between text-foreground text-sm font-semibold pt-3 border-t border-border">
                <span>Total</span>
                <span className="font-headline text-lg">{formatINR(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded bg-foreground text-background text-xs uppercase tracking-[0.2em] font-semibold hover:bg-accent-red hover:text-white transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[10px] text-foreground-muted uppercase tracking-wider pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-red" />
              <span>Two-Year Atelier Care & Resole Guarantee</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

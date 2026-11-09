"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, ShoppingBag, Menu, X } from "lucide-react";
import { BRAND } from "@/config/brand";
import { ThemeToggle } from "./ThemeToggle";
import { useCart } from "@/context/CartContext";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-border/60 bg-background/90 backdrop-blur-md py-3.5"
            : "border-b border-border/30 bg-background/70 backdrop-blur-sm py-4.5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12">
          {/* Logo Left */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="group flex flex-col focus:outline-none"
              aria-label={`${BRAND.name} Home`}
            >
              <span className="font-headline text-lg sm:text-xl font-normal tracking-[0.22em] text-foreground transition-colors duration-300 group-hover:text-accent-red uppercase">
                {BRAND.name}
              </span>
              <span className="font-body text-[9px] uppercase tracking-[0.32em] text-foreground-muted -mt-0.5">
                Atelier Mumbai
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 pl-4">
              {BRAND.navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group relative font-body text-xs uppercase tracking-[0.2em] text-foreground/80 transition-colors duration-200 hover:text-foreground py-1"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-accent-red transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Utilities: Theme Toggle, Profile, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Profile Icon -> /account */}
            <Link
              href="/account"
              aria-label="Private Client Account"
              className="group flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors duration-200 hover:text-accent-red focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
              title="Client Account"
            >
              <User className="h-4 w-4 stroke-[1.4] transition-transform duration-200 group-hover:scale-105" />
            </Link>

            {/* Cart Trigger Button -> Opens Drawer */}
            <button
              type="button"
              onClick={toggleCart}
              aria-label={`Shopping Bag (${totalItems} items)`}
              className="group relative flex h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors duration-200 hover:text-accent-red focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-red"
              title="Shopping Bag"
            >
              <ShoppingBag className="h-4 w-4 stroke-[1.4] transition-transform duration-200 group-hover:scale-105" />
              {/* Badge counter */}
              {totalItems > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-red px-1 text-[9px] font-bold text-white shadow-sm">
                  {totalItems}
                </span>
              ) : (
                <span className="sr-only">0 items in bag</span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground focus:outline-none"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 stroke-[1.4]" />
              ) : (
                <Menu className="h-5 w-5 stroke-[1.4]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/40 bg-background/95 backdrop-blur-lg px-6 py-6 transition-all duration-300">
            <nav className="flex flex-col space-y-4">
              {BRAND.navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-body text-sm uppercase tracking-[0.22em] text-foreground hover:text-accent-red transition-colors py-1 border-b border-border/20"
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-2 text-xs text-foreground-muted font-body tracking-[0.15em] flex justify-between">
                <span>Concierge: {BRAND.contact.phoneFormatted}</span>
                <Link href="/account" className="text-accent-red uppercase tracking-wider">
                  Client Account
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

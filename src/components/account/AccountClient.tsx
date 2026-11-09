"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatINR, BRAND } from "@/config/brand";
import {
  User,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight,
  ExternalLink,
  Plus,
} from "lucide-react";

interface SavedAddress {
  id: string;
  tag: string;
  isDefault: boolean;
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  shoeName: string;
  category: string;
  colour: string;
  size: number;
  price: number;
  status: "Delivered" | "In Crafting" | "Awaiting Handover";
  addressShort: string;
}

const MOCK_PROFILE = {
  name: "Vikramaditya Singhania",
  email: "v.singhania@heritage.in",
  phone: "+91 98201 84930",
  memberSince: "November 2024",
  tier: "Patron Member • Private Client",
  preferredBoutique: "Mumbai (Kala Ghoda Atelier)",
  standardSize: "UK / IND 9",
};

const MOCK_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-1",
    tag: "Residence (Primary)",
    isDefault: true,
    name: "Vikramaditya Singhania",
    street: "Penthouse 14, Sea Face Towers, Worli",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400018",
    phone: "+91 98201 84930",
  },
  {
    id: "addr-2",
    tag: "Family Villa",
    isDefault: false,
    name: "Ananya Deshmukh",
    street: "Bungalow 7, North Main Road, Koregaon Park",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    phone: "+91 98220 54112",
  },
  {
    id: "addr-3",
    tag: "Capital Chambers",
    isDefault: false,
    name: "Vikramaditya Singhania",
    street: "Suite 402, Barakhamba Road, Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    phone: "+91 98110 99420",
  },
];

const MOCK_ORDERS: OrderRecord[] = [
  {
    id: "ord-1",
    orderNumber: "AUR-ORD-2026-9502",
    date: "04 November 2026",
    shoeName: "The Marine Drive Runner",
    category: "Sneakers",
    colour: "Onyx & Slate",
    size: 9,
    price: 26000,
    status: "In Crafting",
    addressShort: "Worli Sea Face, Mumbai 400018",
  },
  {
    id: "ord-2",
    orderNumber: "AUR-ORD-2026-8941",
    date: "28 October 2026",
    shoeName: "The Fort Monolith",
    category: "Boots",
    colour: "Obsidian & Chrome",
    size: 9,
    price: 34500,
    status: "Delivered",
    addressShort: "Worli Sea Face, Mumbai 400018",
  },
  {
    id: "ord-3",
    orderNumber: "AUR-ORD-2026-7215",
    date: "14 August 2026",
    shoeName: "The Kala Ghoda Loafer",
    category: "Loafers",
    colour: "Espresso Antique",
    size: 9,
    price: 29500,
    status: "Delivered",
    addressShort: "Kala Ghoda Atelier Handover, Mumbai",
  },
];

export function AccountClient() {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses">("overview");

  return (
    <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300 py-20 sm:py-28 px-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Profile Header Banner */}
        <div className="border-b border-border pb-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="w-10 h-[1.5px] bg-accent-red" />
              <p className="font-body text-xs uppercase tracking-[0.3em] text-accent-red font-medium">
                {MOCK_PROFILE.tier}
              </p>
              <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.04em]">
                {MOCK_PROFILE.name}
              </h1>
            </div>

            <div className="text-right sm:text-right space-y-1 text-xs text-foreground-muted">
              <span className="block font-body tracking-wider">
                Client ID: <span className="text-foreground font-mono">AUR-VIP-0492</span>
              </span>
              <span className="block text-[11px]">
                Member since {MOCK_PROFILE.memberSince}
              </span>
            </div>
          </div>

          {/* Contact Strip */}
          <div className="pt-4 flex flex-wrap gap-6 text-xs text-foreground-secondary border-t border-border/50">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-accent-red" />
              <span>{MOCK_PROFILE.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-accent-red" />
              <span>{MOCK_PROFILE.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-accent-red" />
              <span>{MOCK_PROFILE.preferredBoutique}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-red" />
              <span>Fitted Size: {MOCK_PROFILE.standardSize}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 sm:gap-8 border-b border-border text-xs uppercase tracking-[0.2em]">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 transition-colors relative font-medium ${
              activeTab === "overview"
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Overview
            {activeTab === "overview" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`pb-3 transition-colors relative font-medium ${
              activeTab === "orders"
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Order History ({MOCK_ORDERS.length})
            {activeTab === "orders" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`pb-3 transition-colors relative font-medium ${
              activeTab === "addresses"
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            Saved Addresses ({MOCK_ADDRESSES.length})
            {activeTab === "addresses" && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent-red" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Recent Order Card */}
            <div className="lg:col-span-7 bg-background-secondary/50 border border-border p-6 sm:p-8 rounded-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-accent-red font-medium block">
                    Active Commission
                  </span>
                  <h3 className="font-headline text-xl text-foreground font-normal">
                    {MOCK_ORDERS[0].shoeName}
                  </h3>
                </div>
                <span className="text-[11px] uppercase tracking-[0.16em] px-2.5 py-1 rounded bg-amber-400/10 text-amber-500 border border-amber-400/20 font-medium">
                  {MOCK_ORDERS[0].status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-foreground-muted block text-[10px] uppercase tracking-wider">
                    Order Reference
                  </span>
                  <span className="font-mono text-foreground font-medium mt-0.5 block">
                    {MOCK_ORDERS[0].orderNumber}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[10px] uppercase tracking-wider">
                    Commissioned On
                  </span>
                  <span className="text-foreground font-body mt-0.5 block">
                    {MOCK_ORDERS[0].date}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[10px] uppercase tracking-wider">
                    Size & Specification
                  </span>
                  <span className="text-foreground font-body mt-0.5 block">
                    UK/IND {MOCK_ORDERS[0].size} • {MOCK_ORDERS[0].colour}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block text-[10px] uppercase tracking-wider">
                    Amount (GST Included)
                  </span>
                  <span className="text-foreground font-medium font-body mt-0.5 block">
                    {formatINR(MOCK_ORDERS[0].price)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs border-t border-border/60">
                <span className="text-foreground-muted text-[11px]">
                  Delivering to: {MOCK_ORDERS[0].addressShort}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="text-accent-red hover:underline flex items-center gap-1 uppercase tracking-wider text-[11px]"
                >
                  <span>View All Commissions</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Primary Shipping Address Card */}
            <div className="lg:col-span-5 bg-background-secondary/50 border border-border p-6 sm:p-8 rounded-sm space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="font-headline text-lg text-foreground font-normal">
                  Primary Delivery Address
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-accent-red">
                  Default
                </span>
              </div>

              <div className="space-y-2 text-xs leading-relaxed">
                <p className="font-semibold text-foreground text-sm">
                  {MOCK_ADDRESSES[0].name}
                </p>
                <p className="text-foreground-secondary">
                  {MOCK_ADDRESSES[0].street}
                </p>
                <p className="text-foreground-secondary">
                  {MOCK_ADDRESSES[0].city}, {MOCK_ADDRESSES[0].state} — PIN {MOCK_ADDRESSES[0].pincode}
                </p>
                <p className="text-foreground-muted pt-1">
                  Contact: {MOCK_ADDRESSES[0].phone}
                </p>
              </div>

              <div className="pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  className="text-accent-red hover:underline text-xs uppercase tracking-wider"
                >
                  Manage All {MOCK_ADDRESSES.length} Addresses &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders List */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {MOCK_ORDERS.map((order) => (
              <div
                key={order.id}
                className="bg-background-secondary/40 border border-border p-6 sm:p-8 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {order.orderNumber}
                    </span>
                    <span className="text-foreground-muted text-xs">•</span>
                    <span className="text-xs text-foreground-muted">{order.date}</span>
                    <span
                      className={`text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded border ${
                        order.status === "Delivered"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-amber-400/10 text-amber-500 border-amber-400/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <h3 className="font-headline text-xl text-foreground font-normal">
                    {order.shoeName}
                  </h3>

                  <p className="font-body text-xs text-foreground-secondary">
                    {order.category} • UK / IND {order.size} • {order.colour}
                  </p>
                  <p className="text-[11px] text-foreground-muted">
                    Handover Address: {order.addressShort}
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-2 sm:self-center">
                  <div className="font-headline text-lg sm:text-xl text-foreground font-medium">
                    {formatINR(order.price)}
                  </div>
                  <span className="block text-[10px] text-foreground-muted uppercase tracking-[0.12em]">
                    Inclusive of 18% GST
                  </span>
                  <Link
                    href="/collection"
                    className="inline-flex items-center gap-1 text-xs text-accent-red hover:underline uppercase tracking-wider pt-1"
                  >
                    <span>Inspect Silhouette</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Saved Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_ADDRESSES.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-background-secondary/40 border border-border p-6 rounded-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-[11px] uppercase tracking-[0.2em] text-accent-red font-medium">
                        {addr.tag}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-foreground text-background">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs leading-relaxed">
                      <p className="font-semibold text-foreground text-sm">
                        {addr.name}
                      </p>
                      <p className="text-foreground-secondary">{addr.street}</p>
                      <p className="text-foreground-secondary">
                        {addr.city}, {addr.state} — PIN {addr.pincode}
                      </p>
                      <p className="text-foreground-muted pt-1">
                        Phone: {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-foreground-muted">
                    <span className="text-[11px]">White-glove courier active</span>
                    <button
                      type="button"
                      className="text-foreground hover:text-accent-red transition-colors text-[11px] uppercase tracking-wider"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 border border-dashed border-border hover:border-accent-red rounded text-xs uppercase tracking-[0.2em] text-foreground-muted hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Indian Delivery Address</span>
              </button>
            </div>
          </div>
        )}

        {/* Atelier Assurance Footnote */}
        <div className="pt-12 border-t border-border text-center text-xs text-foreground-muted uppercase tracking-[0.2em] space-y-1">
          <p>{BRAND.name} Atelier Private Client Registry</p>
          <p className="text-[10px]">
            For concierge assistance, dial {BRAND.contact.phoneFormatted} (11 AM – 8 PM IST)
          </p>
        </div>
      </div>
    </div>
  );
}

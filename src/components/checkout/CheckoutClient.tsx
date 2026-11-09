"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatINR, BRAND } from "@/config/brand";
import {
  Check,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: "upi" | "card" | "cod";
  upiId: string;
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCvv: string;
}

interface CheckoutErrors {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  upiId?: string;
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

interface ConfirmedOrder {
  orderNumber: string;
  date: string;
  items: Array<{
    name: string;
    size: number;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  gstAmount: number;
  shipping: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
}

const INDIAN_STATES = [
  "Maharashtra",
  "Delhi",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "West Bengal",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Punjab",
  "Haryana",
  "Kerala",
  "Goa",
  "Madhya Pradesh",
  "Bihar",
  "Andhra Pradesh",
  "Odisha",
  "Assam",
  "Chandigarh",
  "Jammu & Kashmir",
];

export function CheckoutClient() {
  const { items, subtotal, gstAmount, total, clearCart } = useCart();

  const [form, setForm] = useState<CheckoutForm>({
    name: "Vikramaditya Singhania",
    email: "v.singhania@heritage.in",
    phone: "+91 98201 84930",
    address: "Penthouse 14, Sea Face Towers, Worli",
    landmark: "Opposite Coast Guard Headquarters",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400018",
    paymentMethod: "upi",
    upiId: "singhania@okhdfcbank",
    cardNumber: "4532 8900 1234 5678",
    cardName: "Vikramaditya Singhania",
    cardExpiry: "08/28",
    cardCvv: "849",
  });

  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  const validateField = (field: keyof CheckoutForm, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim() || value.trim().length < 2) {
          return "Please enter your full recipient name (minimum 2 characters).";
        }
        return undefined;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim() || !emailRegex.test(value.trim())) {
          return "Please enter a valid email address for delivery updates (e.g. name@domain.com).";
        }
        return undefined;

      case "phone":
        const cleanPhone = value.replace(/[\s\-\(\)]/g, "");
        const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;
        if (!cleanPhone || !indianPhoneRegex.test(cleanPhone)) {
          return "Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9 (e.g. +91 98201 84930).";
        }
        return undefined;

      case "address":
        if (!value.trim() || value.trim().length < 5) {
          return "Please provide complete street or residence address for courier delivery.";
        }
        return undefined;

      case "city":
        if (!value.trim()) {
          return "Please specify your city of delivery.";
        }
        return undefined;

      case "state":
        if (!value.trim()) {
          return "Please select your Indian state or territory.";
        }
        return undefined;

      case "pincode":
        const pinRegex = /^[1-9][0-9]{5}$/;
        if (!pinRegex.test(value.trim())) {
          return "Please enter a valid 6-digit Indian PIN code (e.g. 400001).";
        }
        return undefined;

      case "upiId":
        if (form.paymentMethod === "upi") {
          const upiRegex = /^[\w.-]+@[\w.-]+$/;
          if (!value.trim() || !upiRegex.test(value.trim())) {
            return "Please enter a valid UPI VPA address (e.g. yourname@okhdfcbank or 9820184930@upi).";
          }
        }
        return undefined;

      case "cardNumber":
        if (form.paymentMethod === "card") {
          const digitsOnly = value.replace(/\s/g, "");
          if (digitsOnly.length < 15 || digitsOnly.length > 16 || isNaN(Number(digitsOnly))) {
            return "Please enter a valid 15 or 16-digit payment card number.";
          }
        }
        return undefined;

      case "cardExpiry":
        if (form.paymentMethod === "card") {
          const expRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
          if (!expRegex.test(value.trim())) {
            return "Please enter expiration date in MM/YY format.";
          }
        }
        return undefined;

      case "cardCvv":
        if (form.paymentMethod === "card") {
          if (!value.trim() || value.trim().length < 3 || isNaN(Number(value))) {
            return "Please enter a valid 3-digit CVV from the back of your card.";
          }
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handleBlur = (field: keyof CheckoutForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: CheckoutErrors = {
      name: validateField("name", form.name),
      email: validateField("email", form.email),
      phone: validateField("phone", form.phone),
      address: validateField("address", form.address),
      city: validateField("city", form.city),
      state: validateField("state", form.state),
      pincode: validateField("pincode", form.pincode),
      upiId: validateField("upiId", form.upiId),
      cardNumber: validateField("cardNumber", form.cardNumber),
      cardExpiry: validateField("cardExpiry", form.cardExpiry),
      cardCvv: validateField("cardCvv", form.cardCvv),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      pincode: true,
      upiId: true,
      cardNumber: true,
      cardExpiry: true,
      cardCvv: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    if (hasErrors) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderNum = `AUR-ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const confirmed: ConfirmedOrder = {
        orderNumber: orderNum,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        items: items.map((i) => ({
          name: i.name,
          size: i.size,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
        })),
        total,
        gstAmount,
        shipping: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        paymentMethod:
          form.paymentMethod === "upi"
            ? `UPI (${form.upiId})`
            : form.paymentMethod === "card"
            ? `Card ending in ${form.cardNumber.slice(-4)}`
            : "Cash on Delivery (White-Glove Handover)",
      };

      setConfirmedOrder(confirmed);
      clearCart();
      setIsSubmitting(false);
    }, 900);
  };

  // If order confirmed, show luxury confirmation screen
  if (confirmedOrder) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300 py-24 sm:py-32 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-10 animate-fadeIn">
          {/* Top Banner */}
          <div className="text-center space-y-4 pb-8 border-b border-border">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-red text-white mb-2">
              <Check className="h-6 w-6 stroke-[2.5]" />
            </div>
            <p className="font-body text-xs uppercase tracking-[0.3em] text-accent-red font-medium">
              Order Placed Successfully
            </p>
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.04em]">
              Thank you, {confirmedOrder.shipping.name}.
            </h1>
            <p className="font-body text-xs sm:text-sm text-foreground-secondary tracking-wide">
              Your bespoke commission has been assigned reference{" "}
              <span className="font-mono text-foreground font-semibold">
                {confirmedOrder.orderNumber}
              </span>.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-background-secondary/60 border border-border p-6 sm:p-8 rounded-sm space-y-6">
            <div className="flex items-center justify-between text-xs pb-4 border-b border-border">
              <span className="font-body uppercase tracking-[0.18em] text-foreground-muted">
                Order Date: {confirmedOrder.date}
              </span>
              <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
                Confirmed & Queued
              </span>
            </div>

            {/* Item summary */}
            <div className="space-y-4">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div>
                    <h3 className="font-headline text-base text-foreground font-normal">
                      {item.name}
                    </h3>
                    <p className="text-xs text-foreground-muted">
                      UK / IND {item.size} &bull; Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-body text-sm font-medium text-foreground">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="pt-4 border-t border-border/80 space-y-2 text-xs">
              <div className="flex justify-between text-foreground-secondary">
                <span>Total Amount Paid / Authorized</span>
                <span className="font-headline text-base font-semibold text-foreground">
                  {formatINR(confirmedOrder.total)}
                </span>
              </div>
              <div className="flex justify-between text-foreground-muted text-[11px]">
                <span>18% GST (Included)</span>
                <span>{formatINR(confirmedOrder.gstAmount)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted text-[11px]">
                <span>Payment Method</span>
                <span className="text-foreground">{confirmedOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Shipping destination */}
            <div className="pt-4 border-t border-border/80 text-xs space-y-1 text-foreground-secondary">
              <span className="font-body uppercase tracking-[0.16em] text-[10px] text-foreground-muted block mb-1">
                Insured Delivery Address
              </span>
              <p className="font-medium text-foreground">{confirmedOrder.shipping.name}</p>
              <p>{confirmedOrder.shipping.address}</p>
              <p>
                {confirmedOrder.shipping.city}, {confirmedOrder.shipping.state} — PIN{" "}
                {confirmedOrder.shipping.pincode}
              </p>
              <p className="text-foreground-muted pt-1">
                Contact: {confirmedOrder.shipping.phone} | {confirmedOrder.shipping.email}
              </p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/account"
              className="w-full sm:w-auto px-8 py-3.5 rounded bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium text-center hover:bg-accent-red hover:text-white transition-colors"
            >
              View in Client Account
            </Link>
            <Link
              href="/collection"
              className="w-full sm:w-auto px-8 py-3.5 rounded border border-border text-xs uppercase tracking-[0.2em] font-medium text-center hover:border-foreground transition-colors"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and no confirmed order, show redirect prompt
  if (items.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300 py-32 px-6 text-center flex flex-col items-center justify-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-background-secondary border border-border flex items-center justify-center text-foreground-muted">
          <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
        </div>
        <h1 className="font-headline text-3xl text-foreground font-normal">
          Your shopping bag is empty
        </h1>
        <p className="font-body text-xs text-foreground-muted max-w-sm leading-relaxed">
          Select your silhouette and size from our collection before proceeding to checkout.
        </p>
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 px-6 py-3 rounded bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-accent-red hover:text-white transition-colors"
        >
          <span>Browse Permanent Collection</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300 py-20 sm:py-28 px-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Header Banner */}
        <div className="space-y-3 pb-8 mb-10 border-b border-border">
          <Link
            href="/collection"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-foreground-muted hover:text-accent-red transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <div className="w-10 h-[1.5px] bg-accent-red" />
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.04em]">
            Bespoke Checkout
          </h1>
          <p className="font-body text-xs text-foreground-secondary tracking-wide">
            Complimentary white-glove insured delivery across all Indian PIN codes.
          </p>
        </div>

        {/* Two-Column Checkout Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Form Details (7 cols) */}
          <form onSubmit={handleSubmit} noValidate className="lg:col-span-7 space-y-10">
            {/* Step 1: Contact Details */}
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground font-normal border-b border-border pb-2.5">
                1. Client Contact Details
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="checkout-name"
                    className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                  >
                    Full Recipient Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                  />
                  {errors.name && (
                    <p className="text-xs text-accent-red pt-0.5">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="checkout-email"
                      className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                    >
                      Email Address *
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="client@domain.in"
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                    />
                    {errors.email && (
                      <p className="text-xs text-accent-red pt-0.5">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="checkout-phone"
                      className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                    >
                      +91 Contact Mobile *
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+91 98201 84930"
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                    />
                    {errors.phone && (
                      <p className="text-xs text-accent-red pt-0.5">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground font-normal border-b border-border pb-2.5">
                2. Shipping Address (India)
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="checkout-address"
                    className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                  >
                    Street & Residence Address *
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    onBlur={() => handleBlur("address")}
                    placeholder="Apartment, building, street, and precinct"
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                  />
                  {errors.address && (
                    <p className="text-xs text-accent-red pt-0.5">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="checkout-landmark"
                    className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                  >
                    Landmark (Optional)
                  </label>
                  <input
                    id="checkout-landmark"
                    type="text"
                    value={form.landmark}
                    onChange={(e) => handleChange("landmark", e.target.value)}
                    placeholder="Near Kala Ghoda, opposite heritage pavilion, etc."
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="checkout-city"
                      className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                    >
                      City *
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                    />
                    {errors.city && (
                      <p className="text-xs text-accent-red pt-0.5">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="checkout-state"
                      className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                    >
                      State *
                    </label>
                    <select
                      id="checkout-state"
                      value={form.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      onBlur={() => handleBlur("state")}
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red cursor-pointer"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s} className="bg-background text-foreground">
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-xs text-accent-red pt-0.5">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="checkout-pincode"
                      className="block text-[11px] uppercase tracking-[0.18em] text-foreground-muted"
                    >
                      6-Digit PIN Code *
                    </label>
                    <input
                      id="checkout-pincode"
                      type="text"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) => handleChange("pincode", e.target.value)}
                      onBlur={() => handleBlur("pincode")}
                      placeholder="400018"
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                    />
                    {errors.pincode && (
                      <p className="text-xs text-accent-red pt-0.5">{errors.pincode}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Choice */}
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground font-normal border-b border-border pb-2.5">
                3. Payment Method (Mocked Secure Gateway)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* UPI Option */}
                <button
                  type="button"
                  onClick={() => handleChange("paymentMethod", "upi")}
                  className={`p-4 rounded border text-left flex flex-col justify-between space-y-2 transition-all ${
                    form.paymentMethod === "upi"
                      ? "border-accent-red bg-accent-red/5 text-foreground ring-1 ring-accent-red"
                      : "border-border bg-background-secondary/60 text-foreground-secondary hover:border-foreground-muted"
                  }`}
                >
                  <QrCode className="h-5 w-5 text-accent-red" />
                  <div>
                    <span className="block font-headline text-sm font-medium">
                      Instant UPI
                    </span>
                    <span className="block text-[10px] text-foreground-muted">
                      GPay, PhonePe, VPA
                    </span>
                  </div>
                </button>

                {/* Card Option */}
                <button
                  type="button"
                  onClick={() => handleChange("paymentMethod", "card")}
                  className={`p-4 rounded border text-left flex flex-col justify-between space-y-2 transition-all ${
                    form.paymentMethod === "card"
                      ? "border-accent-red bg-accent-red/5 text-foreground ring-1 ring-accent-red"
                      : "border-border bg-background-secondary/60 text-foreground-secondary hover:border-foreground-muted"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-accent-red" />
                  <div>
                    <span className="block font-headline text-sm font-medium">
                      Credit / Debit Card
                    </span>
                    <span className="block text-[10px] text-foreground-muted">
                      Visa, Mastercard, Amex
                    </span>
                  </div>
                </button>

                {/* Cash on Delivery Option */}
                <button
                  type="button"
                  onClick={() => handleChange("paymentMethod", "cod")}
                  className={`p-4 rounded border text-left flex flex-col justify-between space-y-2 transition-all ${
                    form.paymentMethod === "cod"
                      ? "border-accent-red bg-accent-red/5 text-foreground ring-1 ring-accent-red"
                      : "border-border bg-background-secondary/60 text-foreground-secondary hover:border-foreground-muted"
                  }`}
                >
                  <Banknote className="h-5 w-5 text-accent-red" />
                  <div>
                    <span className="block font-headline text-sm font-medium">
                      Pay on Handover
                    </span>
                    <span className="block text-[10px] text-foreground-muted">
                      Cash / Card on Delivery
                    </span>
                  </div>
                </button>
              </div>

              {/* Dynamic Payment Details Fields */}
              {form.paymentMethod === "upi" && (
                <div className="p-4 bg-background-secondary/50 border border-border rounded space-y-2 animate-fadeIn">
                  <label
                    htmlFor="checkout-upi"
                    className="block text-[11px] uppercase tracking-[0.16em] text-foreground-muted"
                  >
                    Enter UPI Virtual Payment Address (VPA) *
                  </label>
                  <input
                    id="checkout-upi"
                    type="text"
                    value={form.upiId}
                    onChange={(e) => handleChange("upiId", e.target.value)}
                    onBlur={() => handleBlur("upiId")}
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red"
                  />
                  {errors.upiId && (
                    <p className="text-xs text-accent-red pt-0.5">{errors.upiId}</p>
                  )}
                  <p className="text-[10px] text-foreground-muted">
                    A test approval notification will be mocked automatically.
                  </p>
                </div>
              )}

              {form.paymentMethod === "card" && (
                <div className="p-4 bg-background-secondary/50 border border-border rounded space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label
                      htmlFor="card-number"
                      className="block text-[11px] uppercase tracking-[0.16em] text-foreground-muted"
                    >
                      Card Number *
                    </label>
                    <input
                      id="card-number"
                      type="text"
                      maxLength={19}
                      value={form.cardNumber}
                      onChange={(e) => handleChange("cardNumber", e.target.value)}
                      onBlur={() => handleBlur("cardNumber")}
                      placeholder="4532 8900 1234 5678"
                      className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red font-mono"
                    />
                    {errors.cardNumber && (
                      <p className="text-xs text-accent-red">{errors.cardNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="card-expiry"
                        className="block text-[11px] uppercase tracking-[0.16em] text-foreground-muted"
                      >
                        Expiry (MM/YY) *
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        maxLength={5}
                        value={form.cardExpiry}
                        onChange={(e) => handleChange("cardExpiry", e.target.value)}
                        onBlur={() => handleBlur("cardExpiry")}
                        placeholder="MM/YY"
                        className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red font-mono"
                      />
                      {errors.cardExpiry && (
                        <p className="text-xs text-accent-red">{errors.cardExpiry}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="card-cvv"
                        className="block text-[11px] uppercase tracking-[0.16em] text-foreground-muted"
                      >
                        CVV *
                      </label>
                      <input
                        id="card-cvv"
                        type="password"
                        maxLength={4}
                        value={form.cardCvv}
                        onChange={(e) => handleChange("cardCvv", e.target.value)}
                        onBlur={() => handleBlur("cardCvv")}
                        placeholder="•••"
                        className="w-full bg-background border border-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-red font-mono"
                      />
                      {errors.cardCvv && (
                        <p className="text-xs text-accent-red">{errors.cardCvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {form.paymentMethod === "cod" && (
                <div className="p-4 bg-background-secondary/50 border border-border rounded text-xs text-foreground-secondary space-y-1 animate-fadeIn">
                  <p className="font-medium text-foreground">
                    White-Glove Cash / Card Handover
                  </p>
                  <p className="leading-relaxed">
                    Our atelier courier will deliver your pairs in signature packaging. You may inspect the footwear and verify fit before completing payment.
                  </p>
                </div>
              )}
            </div>

            {/* Place Commission Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 rounded bg-foreground text-background font-body text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 hover:bg-accent-red hover:text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Securing Order with Atelier...</span>
                ) : (
                  <>
                    <span>Confirm Order &bull; {formatINR(total)}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Right Column: Order Summary (5 cols) */}
          <aside className="lg:col-span-5 bg-background-secondary/60 border border-border p-6 sm:p-8 rounded-sm space-y-6">
            <h2 className="font-headline text-xl text-foreground font-normal border-b border-border pb-3">
              Order Summary ({items.length} {items.length === 1 ? "pair" : "pairs"})
            </h2>

            {/* Item list */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.shoeId}-${item.size}`}
                  className="flex gap-3 pb-4 border-b border-border/50 last:border-0"
                >
                  <div className="relative w-16 h-16 bg-background rounded border border-border flex items-center justify-center shrink-0 p-1">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="max-h-full w-auto object-contain"
                    />
                  </div>

                  <div className="flex-1 text-xs space-y-0.5">
                    <h3 className="font-headline text-sm text-foreground font-normal">
                      {item.name}
                    </h3>
                    <p className="text-foreground-muted text-[11px] uppercase tracking-wider">
                      UK/IND {item.size} &bull; Qty {item.quantity}
                    </p>
                    <p className="font-medium text-foreground pt-0.5">
                      {formatINR(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-4 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between text-foreground-secondary">
                <span>Subtotal</span>
                <span>{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted text-[11px]">
                <span>GST (18% Included)</span>
                <span>{formatINR(gstAmount)}</span>
              </div>
              <div className="flex justify-between text-foreground-muted text-[11px]">
                <span>Domestic Delivery (Insured)</span>
                <span className="text-emerald-600 font-medium uppercase tracking-wider">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between text-foreground text-sm font-semibold pt-2 border-t border-border/60">
                <span className="uppercase tracking-[0.14em]">Total Payable</span>
                <span className="font-headline text-lg">{formatINR(total)}</span>
              </div>
            </div>

            {/* Quality badge */}
            <div className="pt-2 text-[10px] text-foreground-muted space-y-1.5 border-t border-border/60">
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-accent-red" />
                <span>Dispatched from Kala Ghoda Atelier, Mumbai</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-red" />
                <span>Two-Year Complimentary Resoling & Care Included</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { BRAND, formatINR } from "@/config/brand";
import { SHOES } from "@/data/shoes";
import { Check, MapPin, Phone, Mail, Clock, ArrowRight, RotateCcw } from "lucide-react";

interface BoutiqueLocation {
  city: string;
  type: string;
  address: string;
  pincode: string;
  hours: string;
}

const BOUTIQUES: BoutiqueLocation[] = [
  {
    city: "Mumbai",
    type: "Flagship Atelier & Private Salon",
    address: "14 Rampart Row, Kala Ghoda, Fort",
    pincode: "400001",
    hours: "Mon – Sat: 11:00 AM – 8:00 PM • Sun: By Appointment",
  },
  {
    city: "New Delhi",
    type: "Boutique & Fitting Suite",
    address: "Unit 104, The Chanakya, Chanakyapuri",
    pincode: "110021",
    hours: "Daily: 11:00 AM – 8:30 PM",
  },
  {
    city: "Bengaluru",
    type: "Private Client Studio",
    address: "48 Lavelle Road, Shanthala Nagar",
    pincode: "560001",
    hours: "Mon – Sat: 10:30 AM – 7:30 PM",
  },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  shoeId: string;
  size: string;
  note: string;
  city: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  shoeId?: string;
  size?: string;
}

interface ConfirmedReservation {
  reservationId: string;
  name: string;
  email: string;
  phone: string;
  shoe: string;
  size: number;
  note?: string;
  city: string;
}

export function ContactSection() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    shoeId: "",
    size: "8",
    note: "",
    city: "Mumbai (Kala Ghoda Atelier)",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<ConfirmedReservation | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Validate a single field
  const validateField = (field: keyof FormState, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) {
          return "Please enter your name. Enter at least 2 alphabetic characters.";
        }
        if (value.trim().length < 2) {
          return "Name is too short. Please provide your full name (minimum 2 characters).";
        }
        return undefined;

      case "email":
        if (!value.trim()) {
          return "Please enter your email address so our concierge can reach you.";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return "Invalid email format. Please include an '@' and valid domain (e.g., name@domain.com).";
        }
        return undefined;

      case "phone":
        if (!value.trim()) {
          return "Please provide an Indian contact number with +91 (e.g., +91 98201 84930).";
        }
        // Match Indian phone numbers: +91 or raw 10 digits
        const cleanPhone = value.replace(/[\s\-\(\)]/g, "");
        const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;
        if (!indianPhoneRegex.test(cleanPhone)) {
          return "Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9 (e.g., +91 98201 84930).";
        }
        return undefined;

      case "shoeId":
        if (!value.trim()) {
          return "Please select a shoe silhouette from our collection dropdown.";
        }
        return undefined;

      case "size":
        if (!value || isNaN(Number(value))) {
          return "Please choose a standard UK/India shoe size between 6 and 12.";
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate all fields
    const newErrors: FormErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      shoeId: validateField("shoeId", formData.shoeId),
      size: validateField("size", formData.size),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      shoeId: true,
      size: true,
    });

    const hasErrors = Object.values(newErrors).some((err) => Boolean(err));
    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      const chosenShoe = SHOES.find((s) => s.id === formData.shoeId);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone.startsWith("+91")
          ? formData.phone
          : `+91 ${formData.phone.replace(/^0/, "")}`,
        shoeId: formData.shoeId,
        shoeName: chosenShoe ? chosenShoe.name : formData.shoeId,
        size: formData.size,
        note: formData.note,
        city: formData.city,
      };

      const response = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit reservation.");
      }

      setSubmittedData({
        reservationId: data.reservationId,
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
        shoe: data.data.shoe,
        size: data.data.size,
        note: data.data.note,
        city: data.data.boutiqueCity,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      shoeId: "",
      size: "8",
      note: "",
      city: "Mumbai (Kala Ghoda Atelier)",
    });
    setErrors({});
    setTouched({});
  };

  return (
    <section
      id="contact"
      aria-label="Atelier Contact and Reservations"
      className="relative w-full bg-background text-foreground py-24 sm:py-32 lg:py-40 transition-colors duration-300 border-b border-border scroll-mt-12"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 sm:mb-20 space-y-4">
          <div className="w-10 h-[1.5px] bg-accent-red" />
          <p className="font-body text-xs uppercase tracking-[0.32em] text-accent-red font-medium">
            Concierge & Fittings
          </p>
          <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.04em] text-foreground leading-[1.15]">
            Atelier appointments & private orders.
          </h2>
        </div>

        {/* Two-Column Grid: Left (Boutiques & Map) / Right (Reservation Form) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* Left Column: Boutique Locations, Map, Contact Info */}
          <div className="lg:col-span-5 space-y-10">
            {/* Direct Contact Channels */}
            <div className="space-y-4 pb-8 border-b border-border">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent-red shrink-0" />
                <div className="text-sm">
                  <span className="text-foreground-muted block text-[11px] uppercase tracking-[0.16em]">
                    Private Concierge
                  </span>
                  <a
                    href={`tel:${BRAND.contact.phoneTel}`}
                    className="font-body text-foreground hover:text-accent-red transition-colors tracking-wide"
                  >
                    {BRAND.contact.phoneFormatted}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent-red shrink-0" />
                <div className="text-sm">
                  <span className="text-foreground-muted block text-[11px] uppercase tracking-[0.16em]">
                    Atelier Correspondence
                  </span>
                  <a
                    href={`mailto:${BRAND.contact.email}`}
                    className="font-body text-foreground hover:text-accent-red transition-colors tracking-wide"
                  >
                    {BRAND.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-accent-red shrink-0" />
                <div className="text-sm">
                  <span className="text-foreground-muted block text-[11px] uppercase tracking-[0.16em]">
                    Operating Hours
                  </span>
                  <span className="font-body text-foreground-secondary text-xs">
                    Mon – Sat: 11:00 AM – 8:00 PM IST • Sun: By Appointment
                  </span>
                </div>
              </div>
            </div>

            {/* Indian Boutique Network */}
            <div className="space-y-6">
              <h3 className="font-body text-xs uppercase tracking-[0.25em] text-foreground font-medium">
                Indian Boutiques & Salons
              </h3>

              <div className="space-y-6">
                {BOUTIQUES.map((boutique) => (
                  <div key={boutique.city} className="space-y-1.5 text-sm">
                    <div className="flex items-baseline justify-between">
                      <h4 className="font-headline text-lg text-foreground font-normal">
                        {boutique.city}
                      </h4>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-accent-red font-medium">
                        PIN {boutique.pincode}
                      </span>
                    </div>
                    <p className="font-body text-xs text-foreground-secondary leading-relaxed">
                      {boutique.address}, PIN {boutique.pincode}
                    </p>
                    <p className="font-body text-[11px] text-foreground-muted tracking-[0.04em]">
                      {boutique.hours}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Map of the Main Address (Kala Ghoda, Fort, Mumbai 400001) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-body text-[11px] uppercase tracking-[0.2em] text-foreground-muted">
                  Kala Ghoda Atelier Map
                </span>
                <span className="text-[10px] text-foreground-muted">
                  14 Rampart Row, Mumbai 400001
                </span>
              </div>

              <div className="relative w-full h-[220px] rounded-sm overflow-hidden border border-border bg-background-secondary shadow-inner">
                <iframe
                  title="Maison Aurelle Flagship Atelier Mumbai"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.864350106963!2d72.82987157585091!3d18.929853982245366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1dd324f3e69%3A0xe543cbe25a4d9526!2sKala%20Ghoda%2C%20Fort%2C%20Mumbai%2C%20Maharashtra%20400001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(70%) contrast(1.15)" }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Right Column: "Reserve a pair" Form or Confirmation */}
          <div className="lg:col-span-7 bg-background-secondary/60 p-8 sm:p-10 lg:p-12 border border-border rounded-sm transition-all duration-300">
            {submittedData ? (
              /* Confirmation Screen: repeats chosen shoe and size */
              <div className="space-y-8 animate-fadeIn" role="status" aria-live="polite">
                <div className="space-y-3 border-b border-border pb-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent-red text-white mb-2">
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <h3 className="font-headline text-2xl sm:text-3xl text-foreground font-normal">
                    Reservation Confirmed
                  </h3>
                  <p className="font-body text-xs text-foreground-secondary tracking-[0.04em] leading-relaxed">
                    Thank you, <strong className="text-foreground font-medium">{submittedData.name}</strong>.
                    Your atelier fitting reservation has been recorded under reference{" "}
                    <code className="text-accent-red font-mono font-medium px-1.5 py-0.5 bg-accent-red/10 rounded">
                      {submittedData.reservationId}
                    </code>.
                  </p>
                </div>

                {/* Repeated Order Summary */}
                <div className="space-y-4 py-4 bg-background p-6 rounded border border-border">
                  <h4 className="font-body text-[11px] uppercase tracking-[0.24em] text-foreground-muted">
                    Fitting Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-foreground-muted block text-[10px] uppercase tracking-[0.14em]">
                        Silhouette Reserved
                      </span>
                      <span className="font-headline text-base text-foreground font-medium mt-0.5 block">
                        {submittedData.shoe}
                      </span>
                    </div>

                    <div>
                      <span className="text-foreground-muted block text-[10px] uppercase tracking-[0.14em]">
                        Shoe Size
                      </span>
                      <span className="font-headline text-base text-foreground font-medium mt-0.5 block">
                        UK / IND {submittedData.size}
                      </span>
                    </div>

                    <div>
                      <span className="text-foreground-muted block text-[10px] uppercase tracking-[0.14em]">
                        Contact Phone
                      </span>
                      <span className="text-foreground font-body mt-0.5 block">
                        {submittedData.phone}
                      </span>
                    </div>

                    <div>
                      <span className="text-foreground-muted block text-[10px] uppercase tracking-[0.14em]">
                        Boutique Location
                      </span>
                      <span className="text-foreground font-body mt-0.5 block">
                        {submittedData.city}
                      </span>
                    </div>
                  </div>

                  {submittedData.note && (
                    <div className="pt-3 border-t border-border/60 text-xs">
                      <span className="text-foreground-muted block text-[10px] uppercase tracking-[0.14em]">
                        Special Request
                      </span>
                      <p className="text-foreground-secondary italic mt-0.5">
                        &ldquo;{submittedData.note}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="font-body text-xs text-foreground-secondary leading-relaxed">
                    Our master concierge will reach out to you via telephone or WhatsApp at{" "}
                    <span className="text-foreground font-medium">{submittedData.phone}</span> within
                    four hours to confirm your scheduled time and leather preferences.
                  </p>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent-red hover:underline focus:outline-none pt-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reserve Another Silhouette</span>
                  </button>
                </div>
              </div>
            ) : (
              /* The Reservation Form */
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="space-y-2 border-b border-border pb-5">
                  <h3 className="font-headline text-2xl sm:text-3xl text-foreground font-normal">
                    Reserve a Pair
                  </h3>
                  <p className="font-body text-xs text-foreground-secondary tracking-[0.04em] leading-relaxed">
                    Arrange a private bespoke fitting session at our ateliers or request reserved holds on limited silhouettes.
                  </p>
                </div>

                {serverError && (
                  <div
                    role="alert"
                    className="p-3 bg-red-500/10 border border-red-500/30 text-accent-red text-xs rounded"
                  >
                    {serverError}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reserve-name"
                    className="block font-body text-[11px] uppercase tracking-[0.2em] text-foreground font-medium"
                  >
                    Client Name *
                  </label>
                  <input
                    id="reserve-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="e.g. Vikramaditya Singhania"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/60 transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                  />
                  {errors.name && (
                    <p id="name-error" className="text-xs text-accent-red font-body pt-0.5">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email and +91 Phone Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reserve-email"
                      className="block font-body text-[11px] uppercase tracking-[0.2em] text-foreground font-medium"
                    >
                      Email Address *
                    </label>
                    <input
                      id="reserve-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="client@heritage.in"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/60 transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-accent-red font-body pt-0.5">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* +91 Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reserve-phone"
                      className="block font-body text-[11px] uppercase tracking-[0.2em] text-foreground font-medium"
                    >
                      +91 Contact Phone *
                    </label>
                    <input
                      id="reserve-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+91 98201 84930"
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/60 transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red"
                    />
                    {errors.phone && (
                      <p id="phone-error" className="text-xs text-accent-red font-body pt-0.5">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Shoe Selection & Size Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Shoe Select (2 cols) */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label
                      htmlFor="reserve-shoe"
                      className="block font-body text-[11px] uppercase tracking-[0.2em] text-foreground font-medium"
                    >
                      Silhouette to Inspect *
                    </label>
                    <select
                      id="reserve-shoe"
                      value={formData.shoeId}
                      onChange={(e) => handleChange("shoeId", e.target.value)}
                      onBlur={() => handleBlur("shoeId")}
                      aria-invalid={Boolean(errors.shoeId)}
                      aria-describedby={errors.shoeId ? "shoe-error" : undefined}
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red cursor-pointer"
                    >
                      <option value="">Select a footwear model...</option>
                      {SHOES.map((shoe) => (
                        <option key={shoe.id} value={shoe.id}>
                          {shoe.name} ({shoe.category}) — {formatINR(shoe.price)}
                        </option>
                      ))}
                    </select>
                    {errors.shoeId && (
                      <p id="shoe-error" className="text-xs text-accent-red font-body pt-0.5">
                        {errors.shoeId}
                      </p>
                    )}
                  </div>

                  {/* Size Select (1 col) */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="reserve-size"
                      className="block font-body text-[11px] uppercase tracking-[0.2em] text-foreground font-medium"
                    >
                      Size (UK/IND) *
                    </label>
                    <select
                      id="reserve-size"
                      value={formData.size}
                      onChange={(e) => handleChange("size", e.target.value)}
                      onBlur={() => handleBlur("size")}
                      aria-invalid={Boolean(errors.size)}
                      aria-describedby={errors.size ? "size-error" : undefined}
                      className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red cursor-pointer"
                    >
                      {BRAND.commerce.shoeSizes.map((s) => (
                        <option key={s} value={String(s)}>
                          UK/IND {s}
                        </option>
                      ))}
                    </select>
                    {errors.size && (
                      <p id="size-error" className="text-xs text-accent-red font-body pt-0.5">
                        {errors.size}
                      </p>
                    )}
                  </div>
                </div>

                {/* Boutique Location Choice */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reserve-city"
                    className="block font-body text-[11px] uppercase tracking-[0.2em] text-foreground font-medium"
                  >
                    Preferred Fitting Location
                  </label>
                  <select
                    id="reserve-city"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red cursor-pointer"
                  >
                    <option value="Mumbai (Kala Ghoda Atelier)">
                      Mumbai — Kala Ghoda Flagship Atelier (PIN 400001)
                    </option>
                    <option value="New Delhi (The Chanakya)">
                      New Delhi — The Chanakya Fitting Suite (PIN 110021)
                    </option>
                    <option value="Bengaluru (Lavelle Road)">
                      Bengaluru — Lavelle Road Private Salon (PIN 560001)
                    </option>
                    <option value="Home Fitting (Private Courier)">
                      White-Glove Home Fitting (Courier Delivery across India)
                    </option>
                  </select>
                </div>

                {/* Note (optional) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reserve-note"
                    className="block font-body text-[11px] uppercase tracking-[0.2em] text-foreground font-medium"
                  >
                    Fitting Notes / Special Inquiries (Optional)
                  </label>
                  <textarea
                    id="reserve-note"
                    rows={3}
                    value={formData.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                    placeholder="Share any sizing particularities (e.g. wide forefoot), preferred appointment times, or bespoke leather requests."
                    className="w-full bg-background border border-border px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/60 transition-colors focus:outline-none focus:ring-1 focus:ring-accent-red focus:border-accent-red resize-y"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 bg-foreground text-background font-body text-xs uppercase tracking-[0.24em] font-semibold transition-all duration-300 hover:bg-accent-red hover:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent-red focus:ring-offset-2 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Recording Reservation...</span>
                    ) : (
                      <>
                        <span>Submit Reservation Request</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <p className="font-body text-[10px] text-foreground-muted tracking-[0.1em] text-center mt-3">
                    No payment required now. {BRAND.commerce.gstInclusiveLabel}.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

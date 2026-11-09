/**
 * Maison Aurelle - Brand & Regional Configuration
 * 
 * Centralised configuration file holding brand identity, contacts,
 * address, Indian commercial conventions, sizing standards, and navigation.
 */

export interface BrandConfig {
  name: string;
  tagline: string;
  descriptor: string;
  contact: {
    phone: string;
    phoneFormatted: string;
    phoneTel: string;
    whatsapp: string;
    email: string;
    conciergeEmail: string;
  };
  atelierAddress: {
    name: string;
    street: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    formatted: string;
  };
  commerce: {
    currencySymbol: string;
    currencyCode: string;
    locale: string;
    gstRate: number;
    gstInclusiveLabel: string;
    gstin: string;
    shoeSizes: readonly number[];
    sizeStandard: string;
  };
  navigation: Array<{
    label: string;
    href: string;
  }>;
  flagshipCities: string[];
}

export const BRAND: BrandConfig = {
  name: "Maison Aurelle",
  tagline: "Indian Haute Cordonnerie",
  descriptor: "Quiet luxury, handcrafted in India with heritage shoemaking artistry.",
  contact: {
    phone: "+91 98201 84930",
    phoneFormatted: "+91 98201 84930",
    phoneTel: "+919820184930",
    whatsapp: "+919820184930",
    email: "concierge@maisonaurelle.com",
    conciergeEmail: "privateclient@maisonaurelle.com",
  },
  atelierAddress: {
    name: "The Maison Aurelle Atelier",
    street: "14 Rampart Row, Kala Ghoda",
    landmark: "Fort Heritage Precinct",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
    formatted: "14 Rampart Row, Kala Ghoda, Fort, Mumbai 400001, Maharashtra, India",
  },
  commerce: {
    currencySymbol: "₹",
    currencyCode: "INR",
    locale: "en-IN",
    gstRate: 0.18,
    gstInclusiveLabel: "Inclusive of 18% GST & complimentary insured courier across India",
    gstin: "27AAACM4829K1Z4",
    shoeSizes: [6, 7, 8, 9, 10, 11, 12] as const,
    sizeStandard: "UK / India",
  },
  navigation: [
    { label: "Collection", href: "/collection" },
    { label: "Craft", href: "/#craft" },
    { label: "Contact", href: "/#contact" },
  ],
  flagshipCities: [
    "Mumbai",
    "New Delhi",
    "Bengaluru",
    "Kolkata",
    "Chennai",
    "Hyderabad",
    "Jaipur",
    "Pune",
  ],
};

/**
 * Format a number using the Indian numbering system (e.g., ₹12,999 or ₹1,25,000)
 */
export function formatINR(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹${formatted}`;
}

/**
 * Format shoe size with Indian / UK standard notation
 */
export function formatShoeSize(size: number): string {
  return `UK/IND ${size}`;
}

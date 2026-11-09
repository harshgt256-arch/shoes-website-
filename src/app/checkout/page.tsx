import { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Bespoke Checkout | Maison Aurelle",
  description: `Complete your handcrafted footwear commission with ${BRAND.name}. Complimentary white-glove insured delivery across India.`,
  openGraph: {
    title: `Checkout | ${BRAND.name}`,
    description: "Secure atelier checkout with UPI, Card, and Cash on Handover delivery options.",
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}

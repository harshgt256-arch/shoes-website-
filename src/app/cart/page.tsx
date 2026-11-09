import { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { CartClient } from "@/components/cart/CartClient";

export const metadata: Metadata = {
  title: "Shopping Bag | Maison Aurelle",
  description: `Review your chosen silhouettes in your ${BRAND.name} shopping bag. Complimentary insured delivery across India.`,
  openGraph: {
    title: `Shopping Bag | ${BRAND.name}`,
    description: "Review selected artisanal footwear models, sizes, and proceed to bespoke checkout.",
  },
};

export default function CartPage() {
  return <CartClient />;
}

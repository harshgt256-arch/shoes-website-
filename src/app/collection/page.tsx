import { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { CollectionClient } from "@/components/collection/CollectionClient";

export const metadata: Metadata = {
  title: "Permanent Footwear Collection",
  description: `Explore the complete permanent collection of ten handcrafted shoes by ${BRAND.name}. Sneakers, Loafers, and Boots made slowly in Mumbai, India.`,
  openGraph: {
    title: `Collection | ${BRAND.name}`,
    description: "Archival Indian haute cordonnerie. Sneakers, loafers, and boots hand-lasted in Mumbai.",
    images: [{ url: "/shoes/shoe2.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Permanent Footwear Collection | ${BRAND.name}`,
    description: "Ten archival silhouettes handcrafted in our Mumbai atelier.",
    images: ["/shoes/shoe2.png"],
  },
};

export default function CollectionPage() {
  return <CollectionClient />;
}

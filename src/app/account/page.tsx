import { Metadata } from "next";
import { BRAND } from "@/config/brand";
import { AccountClient } from "@/components/account/AccountClient";

export const metadata: Metadata = {
  title: "Private Client Profile | Maison Aurelle",
  description: `Access your bespoke order history, commissioned silhouettes, and saved Indian delivery residences with ${BRAND.name}.`,
  openGraph: {
    title: `Client Profile | ${BRAND.name}`,
    description: "Private client account, archival order history, and saved boutique delivery coordinates.",
  },
};

export default function AccountPage() {
  return <AccountClient />;
}

import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk } from "next/font/google";
import "@/styles/globals.css";
import { BRAND } from "@/config/brand";
import { ThemeProvider, themeInitScript } from "@/lib/theme-provider";
import { LenisProvider } from "@/lib/lenis-provider";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-headline",
  style: ["normal", "italic"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: `${BRAND.descriptor} Handcrafted luxury footwear designed and made in India. Atelier Kala Ghoda, Mumbai.`,
  keywords: [
    "Maison Aurelle",
    "Indian luxury shoes",
    "Haute Cordonnerie",
    "handcrafted footwear Mumbai",
    "luxury leather footwear India",
    "bespoke Indian shoes",
  ],
  authors: [{ name: BRAND.name }],
  metadataBase: new URL("https://maisonaurelle.com"),
  openGraph: {
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.descriptor,
    locale: "en_IN",
    type: "website",
    siteName: BRAND.name,
    images: [
      {
        url: "/shoes/shoe1.png",
        width: 1200,
        height: 630,
        alt: `${BRAND.name} Haute Cordonnerie Mumbai`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.descriptor,
    images: ["/shoes/shoe1.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodoniModa.variable} ${hankenGrotesk.variable}`}
    >
      <head>
        {/* Synchronous inline script to prevent light/dark flicker before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-accent-red selection:text-white flex flex-col font-body">
        <ThemeProvider>
          <CartProvider>
            <LenisProvider>
              <Header />
              <main className="flex-1 flex flex-col">{children}</main>
              <CartDrawer />
            </LenisProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

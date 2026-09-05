import type { Metadata, Viewport } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import PWAProvider from "@/components/PWAProvider";
import MetaPixel from "@/components/MetaPixel";

const syne = Syne({ 
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://isivente.vercel.app"),
  title: {
    default: "Isivente — Produits Innovants & Livraison 24h au Bénin",
    template: "%s | Isivente",
  },
  description: "Découvrez nos produits sélectionnés avec soin. Livraison express 24h au Bénin et paiement sécurisé à la livraison.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Isivente",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Isivente — Produits Innovants & Livraison 24h au Bénin",
    description: "Commandez en ligne et payez à la réception en toute sérénité. Livraison 24h à Cotonou, Calavi et partout au Bénin.",
    url: "https://isivente.vercel.app",
    siteName: "Isivente",
    images: [
      {
        url: "/images/logo.png",
        width: 512,
        height: 512,
        alt: "Isivente Boutique en ligne",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Isivente — Produits Innovants & Livraison 24h",
    description: "Commandez en ligne et payez à la réception au Bénin.",
    images: ["/images/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E7C8C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${syne.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0E7C8C" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-bg text-ink antialiased font-sans">
        <MetaPixel />
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}

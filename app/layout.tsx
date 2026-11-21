import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Isivente | Boutique Officielle Bénin",
  description: "Boutique officielle e-commerce au Bénin. Livraison express et paiement à la réception.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={plusJakarta.variable}>
      <head>
        {/* Preconnect & DNS-Prefetch vers les serveurs Meta pour init immédiate par boutique */}
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        {/* Microsoft Clarity chargé en différé complet pour ne jamais bloquer le rendu mobile */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              if (typeof window !== 'undefined') {
                var isAdm = window.location.pathname.indexOf('/admin') === 0 || 
                            window.location.pathname.indexOf('/api') === 0 ||
                            window.localStorage.getItem('isivente_is_admin') === 'true';
                if (isAdm) return;
              }
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "z2fg8kxx85");
          `}
        </Script>
      </body>
    </html>
  );
}

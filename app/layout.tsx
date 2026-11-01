import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";

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
    <html lang="fr">
      <head>
        {/* Meta Pixel Code */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            (function(f,b,e,v){
              if(!f.fbq){
                var n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];
              }
              if(!b.getElementById('fb-pixel-script') && !b.querySelector('script[src*="connect.facebook.net"]')){
                var t=b.createElement(e);t.id='fb-pixel-script';t.async=!0;
                t.src=v;var s=b.getElementsByTagName(e)[0];
                if(s&&s.parentNode){s.parentNode.insertBefore(t,s);}
                else if(b.head){b.head.appendChild(t);}
              }
              if(!f._fbq_initialized){
                f._fbq_initialized=true;
                f.fbq('init', '2150878529184686');
              }
              var isAdm = f.location.pathname.indexOf('/admin') === 0 || 
                          f.location.pathname.indexOf('/api') === 0 ||
                          f.localStorage.getItem('isivente_is_admin') === 'true';
              if (!isAdm) {
                var cleanPath = (f.location.pathname || 'home').toLowerCase().replace(/[^a-z0-9_-]/g, '');
                var lockKey = 'isivente_px_lock_pv_' + cleanPath;
                if (!f.sessionStorage.getItem(lockKey)) {
                  var pvId = 'pv_' + cleanPath + '_' + Math.floor(Date.now() / (6 * 3600 * 1000));
                  f.sessionStorage.setItem(lockKey, pvId);
                  f.fbq('track', 'PageView', {}, { eventID: pvId });
                  try {
                    fetch('/api/pixel/event', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        event_name: 'PageView',
                        event_id: pvId,
                        event_source_url: f.location.href
                      }),
                      keepalive: true
                    }).catch(function(){});
                  } catch(err) {}
                }
              }
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          `}
        </Script>
        {/* Microsoft Clarity (Heatmaps & Session Recording) */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
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
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=2150878529184686&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

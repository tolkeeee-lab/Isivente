import React from "react";

interface StoreMetaPixelProps {
  /**
   * Pixel ID de la boutique propriétaire de la page.
   * Si null/vide (vendeur SaaS sans Pixel configuré), aucun script Meta n'est chargé
   * et window.__ISIVENTE_ACTIVE_PIXEL_ID__ est verrouillé à null (0 % de pollution).
   */
  pixelId: string | null;
}

export default function StoreMetaPixel({ pixelId }: StoreMetaPixelProps) {
  const cleanId = pixelId ? pixelId.replace(/\D/g, "") : "";

  if (!cleanId) {
    return (
      <script
        id="meta-pixel-disabled"
        dangerouslySetInnerHTML={{
          __html: `window.__ISIVENTE_ACTIVE_PIXEL_ID__ = null;`,
        }}
      />
    );
  }

  const isFounderPixel = cleanId === (process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686");

  return (
    <>
      <script
        id={`meta-pixel-${cleanId}`}
        dangerouslySetInnerHTML={{
          __html: `
            window.__ISIVENTE_ACTIVE_PIXEL_ID__ = "${cleanId}";
            (function(f,b,e,v){
              var path = f.location.pathname || '';
              var s = f.location.search || '';
              var isExplicitTest = s.indexOf('test_event_code') !== -1 || s.indexOf('meta_test') !== -1 || s.indexOf('test=') !== -1;
              var isAdm = !isExplicitTest && (
                path.indexOf('/admin') === 0 ||
                path.indexOf('/api') === 0 ||
                path.indexOf('/login') === 0 ||
                path.indexOf('/register') === 0 ||
                f.localStorage.getItem('isivente_is_admin') === 'true'
              );
              if (isAdm) return;

              if(!f.fbq){
                var n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];
              }
              if(!b.getElementById('fb-pixel-script') && !b.querySelector('script[src*="connect.facebook.net"]')){
                var t=b.createElement(e);t.id='fb-pixel-script';t.async=!0;
                t.src=v;var sc=b.getElementsByTagName(e)[0];
                if(sc&&sc.parentNode){sc.parentNode.insertBefore(t,sc);}
                else if(b.head){b.head.appendChild(t);}
              }
              if(!f._fbq_initialized){
                f._fbq_initialized=true;
                f.fbq('init', '${cleanId}');
              }
              var cleanPath = (path || 'home').toLowerCase().replace(/[^a-z0-9_-]/g, '');
              var lockKey = 'isivente_px_lock_pv_' + cleanPath;
              if (!f.sessionStorage.getItem(lockKey)) {
                var sid = f.sessionStorage.getItem('isivente_px_sid');
                if (!sid) {
                  sid = (f.crypto && f.crypto.randomUUID)
                    ? f.crypto.randomUUID().replace(/-/g, '').slice(0, 12)
                    : (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
                  f.sessionStorage.setItem('isivente_px_sid', sid);
                }
                var pvId = 'pv_' + cleanPath + '_' + sid;
                f.sessionStorage.setItem(lockKey, pvId);
                f.fbq('track', 'PageView', {}, { eventID: pvId });
                ${
                  isFounderPixel
                    ? `
                var sendCapi = function() {
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
                };
                if (typeof f.requestIdleCallback === 'function') {
                  f.requestIdleCallback(sendCapi);
                } else {
                  setTimeout(sendCapi, 1500);
                }`
                    : ""
                }
              }
            })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${cleanId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

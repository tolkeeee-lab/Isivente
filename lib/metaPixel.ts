export const PIXEL_CONFIG = {
  pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686",
  currency: "XOF",
  autoPageView: true,
} as const;

export const FB_PIXEL_ID = PIXEL_CONFIG.pixelId;

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Assure que window.fbq existe et met en file d'attente les événements
 * même si le script fbevents.js n'a pas encore fini de charger.
 */
function getFbq(): ((...args: any[]) => void) | null {
  if (typeof window === "undefined") return null;

  if (!window.fbq) {
    const n: any = function (...args: any[]) {
      if (n.callMethod) {
        n.callMethod.apply(n, args);
      } else {
        n.queue.push(args);
      }
    };
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = false;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
  }
  return window.fbq;
}

/**
 * Envoie un événement de secours côté serveur (Meta CAPI Bridge)
 * pour contourner les bloqueurs de publicité et les restrictions iOS/Android.
 */
async function sendServerBridge(eventName: string, customData: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/pixel/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        custom_data: customData,
        event_source_url: window.location.href,
      }),
      keepalive: true,
    }).catch(() => { });
  } catch { }
}

/**
 * Envoie un événement PageView à Meta Pixel
 */
export function trackPageView() {
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "PageView");
  }
  sendServerBridge("PageView");
}

/**
 * Envoie un événement personnalisé
 */
export function trackCustomEvent(name: string, options: Record<string, any> = {}) {
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", name, options);
  }
  sendServerBridge(name, options);
}

/**
 * Événement ViewContent : consultation de la fiche produit
 */
export function trackViewContent(params: {
  content_name: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}) {
  const data = {
    content_name: params.content_name,
    content_category: params.content_category || "E-commerce",
    content_ids: params.content_ids || [],
    content_type: "product",
    value: params.value || 0,
    currency: params.currency || "XOF",
  };

  const fbq = getFbq();
  if (fbq) {
    fbq("track", "ViewContent", data);
  }
  sendServerBridge("ViewContent", data);
}

/**
 * Événement AddToCart : le client sélectionne un bundle ou clique pour commander
 */
export function trackAddToCart(params: {
  content_name: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_type: "product",
    value: params.value || 0,
    currency: params.currency || "XOF",
    num_items: params.num_items || 1,
  };

  const fbq = getFbq();
  if (fbq) {
    fbq("track", "AddToCart", data);
  }
  sendServerBridge("AddToCart", data);
}

/**
 * Événement InitiateCheckout : le client interagit avec le formulaire de commande
 */
export function trackInitiateCheckout(params: {
  content_name: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_type: "product",
    value: params.value || 0,
    currency: params.currency || "XOF",
    num_items: params.num_items || 1,
  };

  const fbq = getFbq();
  if (fbq) {
    fbq("track", "InitiateCheckout", data);
  }
  sendServerBridge("InitiateCheckout", data);
}

/**
 * Événement Purchase : confirmation de la commande (paiement à la livraison)
 */
export function trackPurchase(params: {
  order_id?: string;
  content_name: string;
  content_ids?: string[];
  value: number;
  currency?: string;
  num_items?: number;
}) {
  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_type: "product",
    value: params.value,
    currency: params.currency || "XOF",
    num_items: params.num_items || 1,
    order_id: params.order_id,
  };

  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Purchase", data);
  }
  sendServerBridge("Purchase", data);
}

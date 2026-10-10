import { getUserDataFromStorage } from "./userTracking";

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
async function sendServerBridge(eventName: string, customData: Record<string, any> = {}, eventId?: string) {
  if (typeof window === "undefined") return;

  const userData = getUserDataFromStorage();

  try {
    fetch("/api/pixel/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        custom_data: customData,
        user_data: userData,
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
  const eventId = "pv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "PageView", {}, { eventID: eventId });
  }
  sendServerBridge("PageView", {}, eventId);
}

/**
 * Envoie un événement personnalisé
 */
export function trackCustomEvent(name: string, options: Record<string, any> = {}) {
  const eventId = "custom_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", name, options, { eventID: eventId });
  }
  sendServerBridge(name, options, eventId);
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

  const eventId = "vc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "ViewContent", data, { eventID: eventId });
  }
  sendServerBridge("ViewContent", data, eventId);
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

  const eventId = "atc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "AddToCart", data, { eventID: eventId });
  }
  sendServerBridge("AddToCart", data, eventId);
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

  const eventId = "ic_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const fbq = getFbq();
  if (fbq) {
    fbq("track", "InitiateCheckout", data, { eventID: eventId });
  }
  sendServerBridge("InitiateCheckout", data, eventId);
}

/**
 * Événement Purchase : confirmation de la commande (paiement à la livraison)
 * Dédupliqué avec le serveur CAPI (/api/orders) via eventID.
 */
export function trackPurchase(params: {
  order_id?: string;
  content_name: string;
  content_ids?: string[];
  value: number;
  currency?: string;
  num_items?: number;
}) {
  const eventId = params.order_id ? String(params.order_id).trim() : undefined;

  // 1. Protection anti-doublon en mémoire de session (évite les doubles tirs sur la page de remerciement ou au rafraîchissement)
  if (eventId && typeof window !== "undefined") {
    try {
      const storageKey = `isivente_pixel_purchase_${eventId}`;
      if (sessionStorage.getItem(storageKey)) {
        console.info(`[Meta Pixel] Achat déjà enregistré pour la commande ${eventId}, déduplication active.`);
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {}
  }

  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_type: "product",
    value: params.value,
    currency: params.currency || "XOF",
    num_items: params.num_items || 1,
    order_id: eventId,
  };

  const fbq = getFbq();
  if (fbq) {
    if (eventId) {
      // DÉDUPLICATION OFFICIELLE META : le 4ème paramètre { eventID } permet à Meta de reconnaître
      // que cet événement navigateur et l'événement serveur envoyé par /api/orders sont LA MÊME VENTE.
      fbq("track", "Purchase", data, { eventID: eventId });
    } else {
      fbq("track", "Purchase", data);
    }
  }

  // NOTE CRITIQUE : Ne PAS appeler sendServerBridge("Purchase") ici.
  // La route backend /api/orders déclenche déjà l'événement officiel Meta Conversions API (CAPI)
  // avec l'event_id exact de la commande. Déclencher un second appel CAPI ici triplait le décompte !
}

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
    _fbq_initialized?: boolean;
  }
}

/**
 * Assure que window.fbq existe, que fbq('init', FB_PIXEL_ID) est appelé en premier,
 * et que le script officiel fbevents.js est bien injecté dans le DOM.
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
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    window.fbq = n;
  }

  if (!window._fbq_initialized) {
    window._fbq_initialized = true;
    window.fbq("init", FB_PIXEL_ID);
  }

  if (
    typeof document !== "undefined" &&
    !document.getElementById("fb-pixel-script") &&
    !document.querySelector('script[src*="connect.facebook.net"]')
  ) {
    const t = document.createElement("script");
    t.id = "fb-pixel-script";
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    const s = document.getElementsByTagName("script")[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else if (document.head) {
      document.head.appendChild(t);
    }
  }

  return window.fbq;
}

/**
 * Vérifie si le contexte actuel correspond à un administrateur ou une page admin
 */
function isAdminContext(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (
      window.location.pathname.startsWith("/admin") ||
      window.location.pathname.startsWith("/api") ||
      localStorage.getItem("isivente_is_admin") === "true" ||
      sessionStorage.getItem("isivente_is_admin") === "true" ||
      document.cookie.includes("isivente_admin=true")
    ) {
      return true;
    }
  } catch {}
  return false;
}

/**
 * Génère ou récupère un event_id déterministe par session et par produit
 * afin qu'un même visiteur ne génère JAMAIS de doublons ViewContent, AddToCart ou InitiateCheckout
 */
function getSessionEventLock(
  eventType: string,
  productKey: string
): { alreadySent: boolean; eventId: string } {
  const cleanKey = (productKey || "global").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const storageKey = `isivente_px_lock_${eventType}_${cleanKey}`;
  const eventId = `${eventType}_${cleanKey}_${Math.floor(Date.now() / (6 * 3600 * 1000))}`;

  if (typeof window === "undefined") {
    return { alreadySent: false, eventId };
  }

  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) {
      return { alreadySent: true, eventId: existing };
    }
    sessionStorage.setItem(storageKey, eventId);
  } catch {}

  return { alreadySent: false, eventId };
}

/**
 * Envoie un événement de secours côté serveur (Meta CAPI Bridge)
 * pour contourner les bloqueurs de publicité et les restrictions iOS/Android.
 */
async function sendServerBridge(
  eventName: string,
  customData: Record<string, any> = {},
  eventId?: string,
  overrideUserData?: Record<string, any>
) {
  if (typeof window === "undefined") return;
  if (isAdminContext()) return;

  const storageUserData = getUserDataFromStorage();
  const userData = { ...storageUserData, ...overrideUserData };

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
    }).catch(() => {});
  } catch {}
}

/**
 * Envoie un événement PageView à Meta Pixel (verrouillé à 1 par page chargée)
 */
export function trackPageView() {
  if (isAdminContext()) return;
  const pathKey = typeof window !== "undefined" ? window.location.pathname : "home";
  const { alreadySent, eventId } = getSessionEventLock("pv", pathKey);
  if (alreadySent) return;

  const fbq = getFbq();
  if (fbq) {
    fbq("track", "PageView", {}, { eventID: eventId });
  }
  sendServerBridge("PageView", {}, eventId);
}

/**
 * Envoie un événement personnalisé (1 fois par session)
 */
export function trackCustomEvent(name: string, options: Record<string, any> = {}) {
  if (isAdminContext()) return;
  const { alreadySent, eventId } = getSessionEventLock(`custom_${name}`, options.slug || "page");
  if (alreadySent) return;

  const fbq = getFbq();
  if (fbq) {
    fbq("trackCustom", name, options, { eventID: eventId });
  }
  sendServerBridge(name, options, eventId);
}

/**
 * Événement ViewContent : consultation de la fiche produit (verrouillé à 1 seule fois par produit par session)
 */
export function trackViewContent(params: {
  content_name: string;
  content_category?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}) {
  if (isAdminContext()) return;
  const prodKey = params.content_ids?.[0] || params.content_name || "prod";
  const { alreadySent, eventId } = getSessionEventLock("vc", prodKey);
  if (alreadySent) return;

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
    fbq("track", "ViewContent", data, { eventID: eventId });
  }
  sendServerBridge("ViewContent", data, eventId);
}

/**
 * Événement AddToCart : le client sélectionne un bundle ou clique pour commander (verrouillé à 1 seule fois par produit par session)
 */
export function trackAddToCart(params: {
  content_name: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  if (isAdminContext()) return;
  const prodKey = params.content_ids?.[0] || params.content_name || "prod";
  const { alreadySent, eventId } = getSessionEventLock("atc", prodKey);
  if (alreadySent) return;

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
    fbq("track", "AddToCart", data, { eventID: eventId });
  }
  sendServerBridge("AddToCart", data, eventId);
}

/**
 * Événement InitiateCheckout : le client interagit avec le formulaire de commande (verrouillé à 1 seule fois par produit par session)
 */
export function trackInitiateCheckout(params: {
  content_name: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  if (isAdminContext()) return;
  const prodKey = params.content_ids?.[0] || params.content_name || "prod";
  const { alreadySent, eventId } = getSessionEventLock("ic", prodKey);
  if (alreadySent) return;

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
    fbq("track", "InitiateCheckout", data, { eventID: eventId });
  }
  sendServerBridge("InitiateCheckout", data, eventId);
}

/**
 * Événement Lead : soumission d'un prospect
 */
export function trackLead(params: {
  order_id?: string;
  content_name: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}) {
  if (isAdminContext()) return;
  const eventId = params.order_id ? String(params.order_id).trim() : "lead_" + Date.now();

  if (typeof window !== "undefined") {
    try {
      const storageKey = `isivente_pixel_lead_${eventId}`;
      if (sessionStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");
    } catch {}
  }

  const data = {
    content_name: params.content_name,
    content_ids: params.content_ids || [],
    content_type: "product",
    value: params.value || 0,
    currency: params.currency || "XOF",
    order_id: eventId,
  };

  const fbq = getFbq();
  if (fbq) {
    fbq("track", "Lead", data, { eventID: eventId });
  }
  sendServerBridge("Lead", data, eventId);
}

/**
 * Événement Purchase : confirmation de la commande (paiement à la livraison)
 * Important : Le serveur CAPI (/api/orders) a DÉJÀ envoyé l'événement Purchase avec event_id = order_id.
 * Ici sur la page de succès, on envoie UNIQUEMENT l'événement navigateur fbq('track', 'Purchase', ..., { eventID: order_id })
 * pour que Meta fusionne (1 Navigateur + 1 Serveur CAPI = 1 seul Achat dédupliqué), sans rappeler /api/pixel/event une 2ème fois !
 */
export function trackPurchase(params: {
  order_id?: string;
  content_name: string;
  content_ids?: string[];
  value: number;
  currency?: string;
  num_items?: number;
  customer_phone?: string;
  customer_name?: string;
  customer_email?: string;
  city?: string;
}) {
  if (isAdminContext()) return;
  const eventId = params.order_id ? String(params.order_id).trim() : undefined;

  if (!eventId) {
    console.warn("[Meta Pixel] trackPurchase ignoré : aucun order_id valide fourni pour la déduplication.");
    return;
  }

  if (typeof window !== "undefined") {
    try {
      const storageKey = `isivente_pixel_purchase_${eventId}`;
      if (sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey)) {
        return;
      }
      sessionStorage.setItem(storageKey, "1");
      localStorage.setItem(storageKey, "1");
    } catch {}
  }

  const rawPhone = (params.customer_phone || "").replace(/\D/g, "");
  let cleanPhone = rawPhone;
  if (cleanPhone.length === 8 || cleanPhone.length === 10) {
    if (!cleanPhone.startsWith("229")) {
      cleanPhone = "229" + cleanPhone;
    }
  }

  const nameParts = (params.customer_name || "").trim().split(/\s+/);
  const firstName = nameParts[0] || undefined;
  const lastName = nameParts.slice(1).join(" ") || undefined;
  const city = params.city || "Cotonou";

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
    if (cleanPhone || firstName) {
      try {
        fbq("init", FB_PIXEL_ID, {
          ph: cleanPhone || undefined,
          fn: firstName || undefined,
          ln: lastName || undefined,
          ct: city.toLowerCase(),
          country: "bj",
          external_id: eventId,
        });
      } catch {}
    }

    // Envoi navigateur uniquement (le serveur /api/orders a déjà envoyé le CAPI avec ce même eventID)
    fbq("track", "Purchase", data, { eventID: eventId });
  }
}

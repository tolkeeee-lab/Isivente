export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2150878529184686";

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

/**
 * Envoie un événement PageView à Meta Pixel
 */
export function trackPageView() {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

/**
 * Envoie un événement personnalisé
 */
export function trackCustomEvent(name: string, options: Record<string, any> = {}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", name, options);
  }
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
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "ViewContent", {
      content_name: params.content_name,
      content_category: params.content_category || "E-commerce",
      content_ids: params.content_ids || [],
      content_type: "product",
      value: params.value || 0,
      currency: params.currency || "XOF",
    });
  }
}

/**
 * Événement InitiateCheckout : le client ouvre le formulaire de commande ou commence à remplir
 */
export function trackInitiateCheckout(params: {
  content_name: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_name: params.content_name,
      content_ids: params.content_ids || [],
      value: params.value || 0,
      currency: params.currency || "XOF",
      num_items: params.num_items || 1,
    });
  }
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
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "Purchase", {
      content_name: params.content_name,
      content_ids: params.content_ids || [],
      content_type: "product",
      value: params.value,
      currency: params.currency || "XOF",
      num_items: params.num_items || 1,
      order_id: params.order_id,
    });
  }
}

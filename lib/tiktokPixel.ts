export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "";

declare global {
  interface Window {
    ttq?: any;
  }
}

function getTtq(): any {
  if (typeof window === "undefined") return null;
  return window.ttq;
}

/**
 * Envoie un événement PageView à TikTok Pixel
 */
export function trackTiktokPageView() {
  const ttq = getTtq();
  if (ttq && ttq.page) {
    ttq.page();
  }
}

/**
 * Événement ViewContent : consultation de la fiche produit
 */
export function trackTiktokViewContent(params: {
  content_name: string;
  content_id?: string;
  value?: number;
  currency?: string;
}) {
  const ttq = getTtq();
  if (ttq && ttq.track) {
    ttq.track("ViewContent", {
      contents: [
        {
          content_id: params.content_id || "unknown",
          content_name: params.content_name,
          quantity: 1,
          price: params.value || 0,
        },
      ],
      content_type: "product",
      value: params.value || 0,
      currency: params.currency || "XOF",
    });
  }
}

/**
 * Événement AddToCart : le client sélectionne un bundle ou clique pour commander
 */
export function trackTiktokAddToCart(params: {
  content_name: string;
  content_id?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  const ttq = getTtq();
  if (ttq && ttq.track) {
    ttq.track("AddToCart", {
      contents: [
        {
          content_id: params.content_id || "unknown",
          content_name: params.content_name,
          quantity: params.num_items || 1,
          price: params.value || 0,
        },
      ],
      content_type: "product",
      value: params.value || 0,
      currency: params.currency || "XOF",
    });
  }
}

/**
 * Événement InitiateCheckout : le client interagit avec le formulaire de commande
 */
export function trackTiktokInitiateCheckout(params: {
  content_name: string;
  content_id?: string;
  value?: number;
  currency?: string;
  num_items?: number;
}) {
  const ttq = getTtq();
  if (ttq && ttq.track) {
    ttq.track("InitiateCheckout", {
      contents: [
        {
          content_id: params.content_id || "unknown",
          content_name: params.content_name,
          quantity: params.num_items || 1,
          price: params.value || 0,
        },
      ],
      content_type: "product",
      value: params.value || 0,
      currency: params.currency || "XOF",
    });
  }
}

/**
 * Événement CompletePayment/PlaceAnOrder : confirmation de la commande
 */
export function trackTiktokCompletePayment(params: {
  content_name: string;
  content_id?: string;
  value: number;
  currency?: string;
  num_items?: number;
}) {
  const ttq = getTtq();
  if (ttq && ttq.track) {
    // TikTok privilégie CompletePayment ou PlaceAnOrder pour les achats
    ttq.track("CompletePayment", {
      contents: [
        {
          content_id: params.content_id || "unknown",
          content_name: params.content_name,
          quantity: params.num_items || 1,
          price: params.value || 0,
        },
      ],
      content_type: "product",
      value: params.value,
      currency: params.currency || "XOF",
    });
  }
}

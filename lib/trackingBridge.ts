import { trackViewContent, trackAddToCart, trackInitiateCheckout, trackPurchase } from "./metaPixel";
import { trackTiktokViewContent, trackTiktokAddToCart, trackTiktokInitiateCheckout, trackTiktokCompletePayment } from "./tiktokPixel";

// Bridge ViewContent
export function trackMultiViewContent(params: any) {
  trackViewContent(params);
  trackTiktokViewContent({
    content_name: params.content_name,
    content_id: params.content_ids?.[0],
    value: params.value,
    currency: params.currency
  });
}

// Bridge AddToCart
export function trackMultiAddToCart(params: any) {
  trackAddToCart(params);
  trackTiktokAddToCart({
    content_name: params.content_name,
    content_id: params.content_ids?.[0],
    value: params.value,
    currency: params.currency,
    num_items: params.num_items
  });
}

// Bridge InitiateCheckout
export function trackMultiInitiateCheckout(params: any) {
  trackInitiateCheckout(params);
  trackTiktokInitiateCheckout({
    content_name: params.content_name,
    content_id: params.content_ids?.[0],
    value: params.value,
    currency: params.currency,
    num_items: params.num_items
  });
}

// Bridge Purchase
export function trackMultiPurchase(params: any) {
  trackPurchase(params);
  trackTiktokCompletePayment({
    content_name: params.content_name,
    content_id: params.content_ids?.[0],
    value: params.value,
    currency: params.currency,
    num_items: params.num_items
  });
}

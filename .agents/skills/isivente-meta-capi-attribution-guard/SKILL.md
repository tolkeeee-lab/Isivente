---
name: isivente-meta-capi-attribution-guard
description: >-
  Garde-fou d'attribution publicitaire Meta Pixel (2150878529184686) et Conversions API (CAPI) sur Vercel Serverless.
  Garantit l'envoi asynchrone avec await, la déduplication stricte event_id = order_number, et l'intégrité du product_slug.
---

# 🛡️ Isivente Meta Pixel & CAPI Attribution Guard

Ce skill garantit que 100% des événements e-commerce (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`) arrivent dans Facebook Events Manager sans perte serverless et sans doublon.

---

## ⚡ 1. Règle Serverless Vercel : `await` Obligatoire sur CAPI

Sur Vercel Serverless, toute promesse non attendue (`fire-and-forget`) est coupée dès que la route API renvoie `NextResponse.json(...)`.
- Toujours utiliser **`await sendMetaConversionApiEvent(...)`** dans :
  - `app/api/pixel/event/route.ts`
  - `app/api/orders/route.ts`
  - `app/api/whatsapp/webhook/route.ts`

---

## 🔗 2. Déduplication Exacte Navigateur (`fbq`) + Serveur (`CAPI`)

Facebook déduplique les événements Navigateur et Serveur lorsqu'ils partagent exactement le même `event_name` et le même `event_id` :
1. **Événements de navigation (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`)** :
   - Déclenchés uniquement via `lib/metaPixel.ts`.
   - Verrouillés par `getSessionEventLock(eventName, contentId)` (`sessionStorage`) pour empêcher les re-renders React d'envoyer des doublons.
   - `lib/metaPixel.ts` génère un `eventId` unique et l'envoie simultanément à `window.fbq(..., { eventID })` et à `/api/pixel/event`.
2. **Événement d'achat (`Purchase`)** :
   - **Côté Serveur (CAPI)** : envoyé une seule fois dans `app/api/orders/route.ts` avec `eventId: orderResult.order_number`.
   - **Côté Navigateur (`fbq`)** : envoyé une seule fois sur `app/p/[slug]/success/page.tsx` via `trackPurchase(..., orderId)` où `orderId === order_number`.
   - `trackPurchase` dans `lib/metaPixel.ts` n'appelle **pas** `/api/pixel/event` lorsque `orderId` est déjà fourni, évitant tout double `Purchase` serveur.

---

## 🎯 3. Intégrité Absolue du `product_slug` (Zéro Fallback `"umei"`)

- Dans `app/api/orders/route.ts`, il est **strictement interdit** de remplacer `product_slug` par `"umei"` en cas d'erreur de clé étrangère Supabase (`23503`).
- Si un produit n'existe pas encore dans la table Supabase `products`, `app/api/orders/route.ts` effectue automatiquement un `upsert` du produit depuis `DEFAULT_CATALOG_MAP[slug]` dans `products`, puis réinsère la commande avec son vrai `product_slug`.


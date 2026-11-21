---
name: isivente-anti-doublon-root-cause
description: >-
  Règle d'ingénierie stricte : Zéro Doublon et Résolution à la Racine (Root-Cause Fix Only).
  Interdit formellement de créer des fichiers, routes API, événements Pixel/CAPI, compteurs analytics
  ou correctifs "par-dessus" l'existant. Si une fonctionnalité ne marche pas, diagnostiquer et
  corriger directement la source existante.
---

# 🛡️ Isivente Anti-Doublon & Correction à la Racine (Standard Obligatoire)

Ce skill s'applique à **toutes les interventions** sur le code Isivente (Tracking, Meta Pixel & CAPI, Analytics, Base de données Supabase, Routes API, Composants et Bots).

---

## 🛑 1. La Règle d'Or : Corriger à la Racine, JAMAIS "Par-Dessus"

Lorsqu'un bug, un problème de suivi ou un dysfonctionnement est signalé :
1. **INTERDICTION D'EMPILEMENT** : Ne jamais créer une deuxième fonction, un deuxième appel `fetch`, un deuxième hook ou une route parallèle pour contourner un code qui ne marche pas.
2. **AUDIT PRÉALABLE OBLIGATOIRE** : Avant d'écrire une seule ligne de code, chercher tous les fichiers qui touchent déjà à cette responsabilité et lire le flux de bout en bout.
3. **CORRECTION IN-PLACE** : Réparer ou remplacer directement la ligne défaillante dans le fichier existant, et supprimer immédiatement tout code mort ou redondant.

---

## 🎯 2. Source Unique de Vérité (Single Source of Truth) par Domaine

Chaque responsabilité dans Isivente possède **un seul point d'entrée officiel**. Il est strictement interdit d'émettre des événements ou d'insérer des données en dehors de ces fichiers :

### 📊 A. Meta Pixel & Conversions API (CAPI)
- **Navigateur (`window.fbq`) + Pont CAPI (`PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`)** :
  - Géré **exclusivement** par `lib/metaPixel.ts` via le verrou de session `getSessionEventLock()`.
  - **Règle Zéro Doublon** : 1 visiteur = maximum `1 PageView`, `1 ViewContent`, `1 AddToCart`, `1 InitiateCheckout` par produit et par session.
  - Les composants (`UmeiStyleOrderSection.tsx`, `LikelRiteLanding.tsx`, etc.) ne doivent **jamais** faire de `fetch("/api/pixel/event")` en direct : ils appellent uniquement les fonctions de `lib/metaPixel.ts`.
- **Événement `Purchase` (Achat)** :
  - **Côté Serveur (CAPI)** : Envoyé **une seule fois** avec `await sendMetaConversionApiEvent()` dans `app/api/orders/route.ts` (ou `app/api/whatsapp/webhook/route.ts` pour une vente conclue par le bot) avec `event_id = order_number`.
  - **Côté Navigateur (`fbq`)** : Envoyé **une seule fois** sur `app/p/[slug]/success/page.tsx` via `trackPurchase()` avec exactement le même `eventID = order_number` (sans rappeler `/api/pixel/event`).
  - Résultat dans Meta Events Manager : **1 événement Navigateur + 1 événement Serveur = 1 seul Achat dédupliqué**.

### 👥 B. Comptage des Visiteurs Humains (`analytics`)
- Géré **exclusivement** par `hooks/usePagePresence.ts` -> `lib/analyticsStorage.ts` -> `app/api/analytics/route.ts`.
- **Interdiction absolue** d'appeler `trackUserSession` depuis une modale (`ExitIntentModal.tsx`), un widget ou un composant secondaire.
- **Session unique de 6 heures** par produit (`isivente_visit_session_{slug}`) : un rechargement de page, un retour arrière ou un clic ne doit jamais créer une nouvelle ligne visiteur, mais mettre à jour (`upsert` sur `session_id`) la session existante.

### 🛒 C. Commandes (`orders`) & Paniers Abandonnés (`leads`)
- **Commandes** : Uniquement via `saveNewOrder()` (`lib/ordersStorage.ts`) -> `POST /api/orders` (`app/api/orders/route.ts`).
  - Ne jamais remplacer un `product_slug` par `"umei"` en cas de produit manquant dans la table SQL `products` : toujours faire un `upsert` du vrai `product_slug` dans `products` avant d'insérer la commande.
- **Paniers Abandonnés** : Uniquement via `saveOrUpdateLead()` (`lib/leadsStorage.ts`) avec l'identifiant déterministe `lead_{telephone8chiffres}_{slug}` pour qu'un même client sur un même produit mette à jour sa fiche au lieu de créer 5 lignes.

### 🔀 D. Routes Unifiées & Isolation Multi-Utilisateurs (Interdiction des Routes Parallèles)
- **Ne JAMAIS créer une nouvelle route (page ou API) lorsqu'une route remplissant le même rôle existe déjà** — sauf impossibilité technique avérée et validée.
- **Unifier et isoler par `store_id` au maximum** :
  - **Pages produits** : Une seule route publique unifiée (`/p/[slug]` et `/p/[slug]/success`) pour tous les utilisateurs (fondateur ET vendeurs SaaS). Pas de route parallèle `/s/...` en doublon.
  - **APIs** : Les mêmes routes uniques (`/api/orders`, `/api/leads`, `/api/analytics`, `/api/finances`) servent toutes les boutiques, avec isolation stricte via `store_id` et RLS Supabase.
  - **Isolation Pixel Meta & WhatsApp** : Ne jamais laisser le Pixel ou le numéro WhatsApp du fondateur s'exécuter globalement sur les pages d'autres vendeurs. Chaque page produit charge dynamiquement **uniquement** le `meta_pixel_id`, le `meta_capi_token` et le `whatsapp_number` de la boutique propriétaire (`store_id`) — zéro pollution croisée.

---

## ✅ 3. Checklist de Vérification Avant Chaque Commit

Avant de valider et pousser une modification :
1. **Ai-je créé une nouvelle route parallèle alors qu'une route existante pouvait être unifiée et isolée par `store_id` ?** (Si oui ➔ STOP, unifier dans la route existante).
2. **Ai-je créé un doublon d'appel réseau ou d'événement ?** (Vérifier qu'aucun événement n'est tiré à la fois dans l'enfant et dans le parent).
3. **Ai-je supprimé l'ancien code défectueux au lieu de le laisser tourner à côté ?**
4. **Toutes les promesses serveur sur Vercel (`sendMetaConversionApiEvent`, `sendOrderNotification`, `supabase`) ont-elles bien `await` avant le `return NextResponse.json()` ?**
5. **Le build TypeScript (`npx tsc --noEmit`) passe-t-il avec 0 erreur ?**


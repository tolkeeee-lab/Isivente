---
name: isivente-function-registry-guard
description: >-
  Garde-fou et registre centralisé de toutes les fonctions utilitaires et métiers d'Isivente (lib/ et hooks/).
  Oblige à vérifier l'existence d'une fonction et à l'importer ou la corriger sur place au lieu de recréer
  une fonction en doublon. Inclut un script de vérification automatique des doublons de fonctions.
---

# 🔍 Isivente Function Registry & Anti-Duplicate Function Guard

Ce skill interdit formellement de recréer une fonction qui existe déjà ailleurs dans le projet (`lib/`, `hooks/`, `components/`, `app/api/`). Avant d'écrire **n'importe quelle fonction**, consulter ce registre ou exécuter le script d'audit.

---

## 🛑 1. Protocole Obligatoire Avant de Créer une Fonction

Avant d'écrire `function maFonction(...)` ou `const maFonction = (...) =>` :

1. **Consulter le Registre Officiel ci-dessous** (ou lancer `node .agents/skills/isivente-function-registry-guard/scripts/check-functions.js`).
2. **Si une fonction fait déjà ce travail** :
   - L'importer directement depuis son module officiel (`import { ... } from "@/lib/..."`).
   - **Ne jamais copier-coller** une fonction utilitaire (formatage téléphone, prix, UTM, Pixel, hachage, détection de produit) à l'intérieur d'un composant ou d'une route API.
3. **Si une fonction existante a besoin d'une amélioration ou d'un correctif** :
   - Modifier la fonction **directement dans son fichier d'origine** au lieu de créer une `maFonctionV2` ou une fonction parallèle.

---

## 📚 2. Registre Officiel des Fonctions Isivente (Source Unique par Domaine)

### 📞 A. Numéros de Téléphone Bénin (`@/lib/phoneUtils`)
- `extractDigits(phone)` : Nettoie une chaîne et garde uniquement les chiffres.
- `isBeninPhoneComplete(phone)` : Vérifie si le numéro béninois est complet (10 chiffres si commence par `01`, 8 chiffres sinon).
- `formatBeninPhoneForWhatsApp(phone)` : Formate en `229...` sans doublon d'indicatif pour `https://wa.me/`.
- `formatBeninPhoneForCall(phone)` : Formate en `+229...` pour `tel:`.
- `formatBeninPhoneDisplay(phone)` : Affichage espacé lisible (`01 97 12 34 56`).

### 📊 B. Meta Pixel & Conversions API (`@/lib/metaPixel` & `@/lib/metaConversionsApi`)
- **Côté Client (`@/lib/metaPixel`)** :
  - `trackPageView()` : Envoie `PageView` (Pixel + CAPI dédupliqué).
  - `trackViewContent(slug, title, price)` : Envoie `ViewContent` (verrouillé 1x/session).
  - `trackAddToCart(slug, title, price)` : Envoie `AddToCart` (verrouillé 1x/session).
  - `trackInitiateCheckout(slug, title, price, userData?)` : Envoie `InitiateCheckout` (verrouillé 1x/session).
  - `trackPurchase(slug, title, price, orderId, userData?)` : Envoie `Purchase` navigateur avec `eventID = orderId`.
- **Côté Serveur uniquement (`@/lib/metaConversionsApi`)** :
  - `sendMetaConversionApiEvent(options)` : Envoie un événement CAPI haché SHA-256 à Graph API (toujours utiliser avec `await`).

### 🎯 C. Attribution Publicitaire & Cookies `_fbc` / `_fbp` (`@/lib/utm` & `@/lib/userTracking`)
- `captureAndPersistAttribution()` (`@/lib/utm`) : Capture `utm_source`, `utm_campaign`, `utm_content`, `fbclid` et persiste `_fbc` / `_fbp`.
- `getStoredAttribution()` (`@/lib/utm`) : Lit les paramètres UTM stockés dans la session/localStorage.
- `getUserDataFromStorage()` (`@/lib/userTracking`) : Récupère `fbc`, `fbp`, téléphone, prénom, nom et ville du visiteur pour enrichir le score EMQ Meta.

### 📦 D. Catalogue Produits (`@/lib/defaultCatalog`)
- `DEFAULT_CATALOG` & `DEFAULT_CATALOG_MAP` : Liste et dictionnaire indexé par `slug` de tous les produits (titre, prix, `accentColor`, `keywords`, image, bundles).
- `getAdminDashboardProducts()` : Liste formatée pour le tableau de bord admin.
- `getOrderModalCatalog()` : Dictionnaire `{ title, price }` par `slug`.

### 🛒 E. Commandes & Paniers Abandonnés (`@/lib/ordersStorage` & `@/lib/leadsStorage`)
- **Commandes (`@/lib/ordersStorage`)** :
  - `saveNewOrder(orderData)` : Enregistre une commande via `/api/orders` avec fallback résilient.
  - `getAllOrders()` / `updateOrderStatus(id, status)` / `deleteOrder(id)`.
- **Paniers Abandonnés (`@/lib/leadsStorage`)** :
  - `saveOrUpdateLead(data)` : Capture ou met à jour un prospect dès que son numéro est complet (`lead_{phone}_{slug}`).
  - `markLeadConverted(phone, productSlug?)` : Passe le prospect en `converted` après commande.
  - `getAllLeads()` / `updateLeadStatus(id, status)` / `deleteLead(id)`.

### 📈 F. Visiteurs & Temps de Présence (`@/hooks/usePagePresence` & `@/lib/analyticsStorage`)
- `usePagePresence(slug)` (`@/hooks/usePagePresence`) : Seul hook autorisé à compter une visite produit (1 session par 6h) et la durée passée.
- `recordOrderClick(slug)` (`@/lib/analyticsStorage`) : Marque un clic sur le bouton de commande.
- `getAnalyticsStats()` / `getAnalyticsStatsByProduct()` (`@/lib/analyticsStorage`) : Statistiques globales et par produit dédupliquées.

### 💬 G. Agent Commercial WhatsApp & Notifications (`@/lib/whatsappAgent` & `@/lib/notifyHelper`)
- `processIncomingWhatsAppMessage(phone, message, context?)` (`@/lib/whatsappAgent`) : Traite un message WhatsApp entrant, répond aux objections et détecte l'adresse de livraison.
- `detectProductFromMessage(message, fallbackSlug?)` (`@/lib/whatsappAgent`) : Identifie le produit via les `keywords` de `DEFAULT_CATALOG`.
- `detectLocationFromMessage(message)` (`@/lib/whatsappAgent`) : Détecte la ville et le quartier béninois.
- `sendOrderNotification(order)` (`@/lib/notifyHelper`) : Envoie l'alerte de nouvelle commande (Gmail SMTP, Telegram, Ntfy).

### 🔊 H. Effets Sonores (`@/lib/soundEffects`)
- `playOrderSound()` : Joue le son de confirmation lors d'une commande validée.

---

## 🛠️ 3. Vérification Automatique par Script

Exécuter à tout moment :
```bash
node .agents/skills/isivente-function-registry-guard/scripts/check-functions.js
```
Ce script analyse tous les fichiers de `lib/` et `hooks/` et signale immédiatement toute fonction déclarée en doublon dans deux fichiers différents.


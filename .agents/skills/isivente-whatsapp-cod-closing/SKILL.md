---
name: isivente-whatsapp-cod-closing
description: >-
  Standard de conversation commerciale, gestion des objections et closing Cash-on-Delivery (COD) sur WhatsApp
  pour le marché béninois (Cotonou, Abomey-Calavi, Porto-Novo, Parakou, Ouidah, Bohicon).
---

# 💬 Isivente WhatsApp COD Closing Standard (Marché Bénin)

Ce skill encadre toute la logique de conversion WhatsApp d'Isivente : l'agent automatique Awa (`lib/whatsappAgent.ts`), les relances de paniers abandonnés et le modal d'interception de sortie (`components/features/ExitIntentModal.tsx`).

---

## 🇧🇯 1. Les 3 Piliers de Confiance COD au Bénin

Chaque réponse WhatsApp (automatique ou pré-remplie) doit rassurer immédiatement le client sur les 3 freins majeurs du marché local :
1. **Zéro paiement à l'avance** : Le client ne paie rien en ligne ni avant l'arrivée du livreur. Il paie uniquement à la réception (`Cash on Delivery`).
2. **Droit de vérification à la livraison** : Le client peut voir et vérifier son article devant le livreur avant de régler.
3. **Rapidité et clarté des délais par ville** :
   - **Cotonou & Abomey-Calavi** : Livraison express en **moins de 24h** (souvent le jour même).
   - **Porto-Novo, Ouidah, Bohicon, Parakou & autres villes** : Expédition rapide sous **24h à 48h**.

---

## 🎯 2. Règle du Closing en 1 Question (Appel à l'Action Systématique)

Un message WhatsApp ne doit **jamais** se terminer en impasse ("Merci", "À bientôt").
- Tant que la commande n'est pas validée, chaque message de réponse à une objection (prix, qualité, délai, fonctionnement) doit se terminer par une **question ouverte simple de clôture** :
  > *"Dans quelle ville et quel quartier souhaitez-vous être livré(e) aujourd'hui ?"*

---

## 🔗 3. Synchronisation Automatique avec le Catalogue (`lib/defaultCatalog.ts`)

- L'agent WhatsApp (`lib/whatsappAgent.ts`) et le modal de sortie (`components/features/ExitIntentModal.tsx`) lisent dynamiquement le nom du produit, son prix et ses mots-clés depuis `DEFAULT_CATALOG` (`lib/defaultCatalog.ts`).
- Lorsqu'une commande est confirmée par WhatsApp (détection de la ville/quartier dans `app/api/whatsapp/webhook/route.ts`), elle est :
  1. Enregistrée dans Supabase (`orders`) avec le vrai `product_slug`.
  2. Marquée comme convertie dans `abandoned_leads`.
  3. Envoyée à Meta Conversions API (`Purchase`) avec `await sendMetaConversionApiEvent(...)` pour que Facebook attribue la vente WhatsApp à la publicité d'origine.

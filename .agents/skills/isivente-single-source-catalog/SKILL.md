---
name: isivente-single-source-catalog
description: >-
  Architecture Source Unique (Single Source of Truth) du catalogue Isivente.
  Centralise le titre, le prix, l'image, la couleur (accentColor) et les mots-clés WhatsApp (keywords)
  dans lib/defaultCatalog.ts afin de ne jamais dupliquer un produit dans UmeiStyleOrderSection.tsx ou whatsappAgent.ts.
---

# 📦 Isivente Single-Source Catalog Architecture (Zéro Duplication)

Ce skill définit la procédure unique et centralisée pour ajouter ou modifier un produit sur Isivente sans jamais dupliquer l'information dans plusieurs fichiers.

---

## 🎯 1. Un Seul Fichier de Vérité : `lib/defaultCatalog.ts`

Toutes les métadonnées d'un produit sont définies **une seule fois** dans `DEFAULT_CATALOG` (`lib/defaultCatalog.ts`) :
- `id` : Identifiant par défaut (`"<slug>-default"`)
- `slug` : Identifiant URL unique (ex: `"likel-rite"`)
- `title` & `shortTitle` : Nom complet et nom court
- `price` : Prix unique en FCFA (ex: `14900`)
- `accentColor` : Couleur hexadécimale principale de la page (ex: `"#B45309"`)
- `keywords` : Tableau de mots-clés permettant au bot WhatsApp Awa (`lib/whatsappAgent.ts`) de reconnaître automatiquement le produit
- `image_url` & `image` : Visuel principal
- `bundles` : Offre unique

---

## 🎨 2. Dérivation Automatique du Thème dans `UmeiStyleOrderSection.tsx`

- **Interdiction absolue** de recréer un dictionnaire `THEME_PALETTES` en dur par produit dans `components/features/UmeiStyleOrderSection.tsx`.
- La fonction `buildDynamicTheme(resolvedAccentColor)` calcule automatiquement les 8 nuances nécessaires (bouton principal, survol, fond léger `6%`, bordure `28%`, anneau de focus `25%`, badge `12%`, texte contrasté) directement à partir de la prop `accentColor` passée par la landing page ou de `DEFAULT_CATALOG_MAP[slug]?.accentColor`.

---

## 🤖 3. Reconnaissance Automatique par le Bot WhatsApp (`lib/whatsappAgent.ts`)

- **Interdiction absolue** de maintenir une liste `PRODUCT_KEYWORDS` séparée dans `lib/whatsappAgent.ts`.
- La fonction `detectProductFromMessage` lit directement `DEFAULT_CATALOG` (`prod.keywords`, `prod.slug`, `prod.shortTitle`) depuis `lib/defaultCatalog.ts`.

---

## 🚀 4. Checklist en 3 Étapes pour Créer un Nouveau Produit

Lors de la création d'un nouveau produit :
1. **Créer la Landing Page** `components/features/<NomProduit>Landing.tsx` (clonée sur `UmeiLanding.tsx`, conforme aux 7 Piliers et passant `accentColor="#..."` à `<UmeiStyleOrderSection />`).
2. **Déclarer le Produit dans `lib/defaultCatalog.ts`** (avec `slug`, `title`, `shortTitle`, `price`, `accentColor`, `keywords`, `image_url`, `bundles`).
3. **Brancher la Route dans `app/p/[slug]/page.tsx`** (`if (normalizedSlug === "<slug>") return <NomProduitLanding ... />`).

*(La table Supabase `products` est synchronisée automatiquement par `/api/orders` en cas de nouvelle commande grâce à l'auto-upsert sur `product_slug`).*


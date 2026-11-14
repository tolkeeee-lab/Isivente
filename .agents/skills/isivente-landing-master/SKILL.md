---
name: isivente-landing-master
description: >-
  Standard d'ingénierie et de design e-commerce obligatoire pour la création et la modification
  de toutes les landing pages Isivente. Définit l'architecture d'offre unique, le placement prioritaire
  du formulaire de commande, les carrousels auto-défilants, l'autoplay vidéo et le thème 100% clair.
---

# 🚀 Isivente Landing Page Master Standard (Checklist Pré-Vol Obligatoire)

Ce document constitue la **spécification d'architecture et de design incontournable** pour toute page produit ou landing page créée ou modifiée dans ce projet.

---

## 🛑 1. La Règle Zéro : Consultation Préalable Systématique
Avant d'écrire une seule ligne de code pour une landing page produit :
1. **Consulter et appliquer scrupuleusement les 6 piliers ci-dessous.**
2. **Ne jamais dévier de ces règles sans demande explicite de l'utilisateur.**

---

## 🎯 2. Les 6 Piliers Fondamentaux de Chaque Landing Page

### 💎 Pilier 1 : Offre Unique (Single Offer)
- **Zéro sélecteur de packs multiples** (Duo, Trio, VIP, SD) sur la page principale.
- Le tableau `BUNDLES` contient **un seul et unique objet** représentant l'article à son prix fixe :
  ```typescript
  const BUNDLES: BundleOption[] = [
    {
      id: "solo",
      name: "Nom Officiel du Produit",
      subtitle: "Coffret complet avec accessoires officiels, câble et garantie",
      price: 29900,
      originalPrice: 45000,
      savings: 15100,
      quantity: 1,
      popular: true,
    },
  ];
  ```
- **Harmonisation intégrale du prix** :
  - Header Navigation : `(29 900 F)`
  - CTA Vidéo : `Commander maintenant (29 900 FCFA)`
  - Formulaire de Commande : `29 900 FCFA`
  - Sticky Mobile CTA Bar : `price={29900}`
  - Message WhatsApp : `"...à 29 900 FCFA avec livraison à domicile."`
  - Meta Pixel : `value: 29900`
- Les offres additionnelles (2ème unité à prix cassé) sont réservées **exclusivement au tunnel post-achat (Upsell/Downsell)**.

---

### 📍 Pilier 2 : Emplacement Prioritaire du Formulaire de Commande (COD)
- Le formulaire de commande (`<UmeiStyleOrderSection />` dans `<div ref={orderSectionRef} id="commander">`) doit être placé **immédiatement sous la galerie d'images Hero et les 3 badges de réassurance** (Livraison 24h, Test à Réception, Rechargeable/Garantie).
- Cet agencement maximise la conversion directe dès l'arrivée du visiteur sans obliger à scroller jusqu'au bas de la page.

---

### 🔄 Pilier 3 : Carrousels à Défilement Automatique (Auto-Advancing)
1. **Galerie Hero Principale (Règle Stricte des 5 Images Max)** :
   - **Nombre de slides :** Toujours EXACTEMENT 5 visuels ordonnés selon une narration de vente (1. Accroche/Hero ➔ 2. Polyvalence/Multi-zones ➔ 3. Mode d'utilisation 2-en-1 ➔ 4. Niveaux de puissance ➔ 5. Technologie & Batterie).
   - Les autres images fournies sont obligatoirement distribuées dans les sections éditoriales ("Comment ça fonctionne ?", "Dimensions & Contenu du Coffret", etc.).
   - Défilement automatique toutes les ~3,8 secondes.
   - Pause immédiate au survol (`onMouseEnter={() => setIsHeroHovered(true)}`).
   - Boutons de navigation manuelle discrets gauche / droite (`ChevronLeft` / `ChevronRight`).
   - Miniatures interactives synchronisées.
2. **Galeries d'Exploration Sociales (TikTok / Instagram / Démonstrations)** :
   - Défilement horizontal automatique fluide avec pause au survol.
   - Boutons fléchés pour naviguer manuellement d'une vue à l'autre.

---

### ▶️ Pilier 4 : Lecture Automatique de la Vidéo (Autoplay)
- Toute vidéo de démonstration produit doit démarrer automatiquement à l'affichage :
  ```tsx
  <video
    ref={videoRef}
    src="/videos/demo.mp4"
    poster="/images/video-cover.webp"
    autoPlay
    muted
    playsInline
    loop
    controls
    preload="auto"
    className="w-full h-full object-cover"
  />
  ```
- Les contrôles (`controls`) restent disponibles pour que l'utilisateur puisse mettre en pause, réactiver le son ou avancer dans la vidéo à tout moment.

---

### ☀️ Pilier 5 : Thème 100% Clair (Figma-Grade Light Mode)
- **Fond principal** : Blanc épuré `#FFFFFF` ou fond clair soyeux `#F8FAFC`.
- **Cartes & Conteneurs** : Fond blanc, bordure fine `border-slate-200/90`, liseré biseauté supérieur `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_4px_20px_-4px_rgba(0,0,0,0.06)]`.
- **Typographie** : `text-slate-900` pour les titres, `text-slate-600` pour les textes, `tabular-nums` pour les montants.
- **Zéro AI-Slop** : Pas d'émojis dans les titres, icônes SVG fines `stroke-[1.75]`.

---

### ⚡ Pilier 6 : Déploiement Continu & Validation
- Chaque modification doit être validée par `npm run build` (0 erreur).
- Commit & push immédiat sur `origin/main` pour mise en ligne automatique sur Vercel.

---

### 📲 Pilier 7 : Filet de Sauvetage & Capture d'Objections WhatsApp (Exit Intent)
- **Composant obligatoire** : `<ExitIntentModal slug={slug} />` actif sur chaque route produit (intégré nativement dans le layout/wrapper `app/p/[slug]/page.tsx`).
- **Objectif CRO** : Récupérer les indécis avant qu'ils ne quittent et comprendre la cause exacte du départ.
- **Mécanique** :
  1. Détection de sortie : Mouvement de souris vers la barre d'onglets (Desktop) ou tentative de retour arrière (Mobile).
  2. 4 options 1-clic traitant les objections clés (Prix trop élevé, Vérification de livraison par ville, Doute sur la qualité/test à réception, Préférence commande par message).
  3. Champ de question libre si l'objection du client n'est pas dans la liste.
  4. Redirection automatique vers WhatsApp (`wa.me/2290192901817`) avec le nom du produit, le prix et le texte de l'objection pré-rédigé.
  5. Tracking Pixel Meta (`ExitWhatsApp_Redirect`) pour analyser les motifs d'abandon.

---

### 🚀 Pilier 8 : Performance Mobile 90+ & Vitesse Instantanée (Anti-Perte 95%)
Sur les réseaux mobiles d'Afrique de l'Ouest (MTN / Moov 3G/4G), toute seconde de latence fait fuir 90%+ des acheteurs avant même que le Pixel ne s'allume.
Chaque landing page et chaque composant DOIT impérativement respecter les règles de vitesse suivantes :

1. **Poids Max des Images (< 100 Ko par image, < 800 Ko pour toute la page)** :
   - Interdiction formelle d'uploader des JPEGs bruts de 400-600 Ko.
   - Toujours compresser avec MozJPEG progressif (`sharp`) à `quality: 78`, redimensionné à max 960x960.
   - Activer nativement `formats: ['image/avif', 'image/webp']` dans `next.config.mjs`.
2. **Chargement Différé des Visuels Secondaires (`loading="lazy"`)** :
   - Seule l'image Hero principale au-dessus de la ligne de flottaison est en `priority`.
   - Toutes les miniatures de carrousel et images des sections éditoriales ("Comment ça fonctionne", "Dimensions") DOIVENT porter `loading="lazy"`.
3. **Exécution Instantanée du Pixel Meta dans le `<head>`** :
   - Ne JAMAIS charger le Pixel Meta en `afterInteractive` (ce qui attend la fin de l'hydratation React).
   - Le script de base du Pixel est injecté directement dans le `<head>` avec balise `<noscript>`.
   - Toujours pré-connecter les serveurs Meta dès le premier octet :
     ```html
     <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
     <link rel="dns-prefetch" href="https://connect.facebook.net" />
     ```
   - Le signal `PageView` part ainsi vers Meta **en moins de 200 ms**, garantissant un taux de rétention clics ➔ visites > 85%.
4. **Code-Splitting Modulaire (`next/dynamic`)** :
   - Dans `app/p/[slug]/page.tsx`, chaque landing page produit est importée dynamiquement via `dynamic(() => import(...))` pour ne JAMAIS embarquer le code des 35 autres produits dans le bundle du produit visité.
5. **Délestage des Outils Tiers (Clarity en `lazyOnload`)** :
   - Microsoft Clarity ou tout script d'analytics lourd doit être chargé en `strategy="lazyOnload"` pour ne pas voler un seul cycle de processeur mobile au moment de l'affichage.

---

### 👁️ Pilier 9 : Raccordement Obligatoire des Visites (`usePagePresence`) & Capture Silencieuse de Prospects
**Interdiction absolue de publier une landing page sans brancher le tracking de présence et la capture de prospect :**

1. **Raccordement de présence obligatoire** :
   - Chaque composant de landing page (`components/features/<Produit>Landing.tsx`) DOIT importer et exécuter le hook :
     ```typescript
     import { usePagePresence } from "@/hooks/usePagePresence";
     
     export default function ProduitLanding({ slug = "mon-produit" }: { slug?: string }) {
       const { recordInteraction } = usePagePresence(slug);
       ...
     ```
   - Lier `recordInteraction()` sur chaque clic de CTA ou bouton scrollant vers le formulaire.
2. **Capture Silencieuse des Prospects (`saveOrUpdateLead`)** :
   - Dès que le prospect saisit au moins 8 chiffres dans le champ téléphone du formulaire (avant même de cliquer sur "Commander"), ses informations partielles DOIVENT être sauvegardées silencieusement pour permettre la relance WhatsApp :
     ```typescript
     import { saveOrUpdateLead } from "@/lib/leadsStorage";

     useEffect(() => {
       const cleanPhone = customerPhone.replace(/\D/g, "");
       if (cleanPhone.length >= 8) {
         saveOrUpdateLead({
           customer_name: customerName,
           customer_phone: cleanPhone,
           customer_phone2: customerPhone2,
           city: city,
           address: address,
           product_slug: slug,
           product_title: "Titre Officiel du Produit",
           bundle_name: selectedBundle.name,
           total_amount: selectedBundle.price,
         });
       }
     }, [customerPhone, customerName, customerPhone2, city, address, selectedBundle]);
     ```

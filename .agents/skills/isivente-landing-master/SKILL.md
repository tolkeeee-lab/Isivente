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
1. **Galerie Hero Principale** :
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

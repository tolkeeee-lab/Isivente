---
name: isivente-landing-master
description: >-
  Standard d'ingénierie et de design e-commerce obligatoire pour la création et la modification
  de toutes les landing pages Isivente. Définit l'architecture d'offre unique, le placement prioritaire
  du formulaire de commande, les carrousels auto-défilants, l'autoplay vidéo et le thème 100% clair.
---

# 🚀 Isivente Landing Page Master Standard (Checklist Pré-Vol Obligatoire)

Ce document constitue la **spécification d'architecture et de design incontournable** pour toute page produit ou landing page créée ou modifiée dans ce projet. Il s'applique à la création de chaque nouvelle landing page, pour assurer qu'elles soient toutes conformes au standard actuel (comme la page Umei).

---

## 🛑 1. La Règle Zéro : Consultation Préalable Systématique
Avant d'écrire une seule ligne de code pour une landing page produit :
1. **Consulter et appliquer scrupuleusement les 6 piliers ci-dessous.**
2. **Ne jamais dévier de ces règles sans demande explicite de l'utilisateur.**
3. **Le template de référence à DUPLIQUER OBLIGATOIREMENT est `components/features/UmeiLanding.tsx`. Toute nouvelle page de vente DOIT avoir exactement la même structure.**

---

## 🏗️ 2. Structure Exacte Requise (Basée sur UmeiLanding)

Chaque landing page doit être construite avec la hiérarchie et les sections exactes suivantes :

1. **Bandeau Top Bar Clair Épuré** : Barre d'annonce avec message de livraison express et paiement à la livraison.
2. **Header Navigation Fond Clair** : Logo ISIVENTE et bouton "Commander" avec ancre vers le formulaire et affichage du prix (ex: `(14 900 F)`).
3. **Conteneur Principal** : `main` avec un max-width.
4. **En-tête Titre & Accroche** : Badge introductif, grand titre accrocheur, et sous-titre explicatif.
5. **Image Hero Unique** : Une seule image mise en avant avec badges circulaires superposés. Pas de texte inutile, pas de carrousel ici (sauf exception demandée).
6. **3 Badges de Réassurance** : "Livraison Express 24h", "Paiement à la Réception", "Garantie & Test 100%". Placés côte à côte (Pilier 2).
7. **Formulaire de Commande (COD) - IMMÉDIATEMENT APRÈS** : Utilisation du composant `<UmeiStyleOrderSection />`. C'est **absolument obligatoire** de le placer ici, juste sous le hero et les badges.
8. **Grille des Bénéfices / Fonctions Majeures** : Section décrivant les 4 avantages principaux avec icônes.
9. **Démonstration Vidéo (Autoplay)** : Vidéo qui se lance automatiquement (Pilier 4).
10. **Bénéfices Comparatifs** : Tableau ou liste "Classique vs Produit Isivente".
11. **Infographie / Guide Visuel** : Image explicative supplémentaire.
12. **Bannière Promotionnelle & Rappel Prix** : CTA secondaire redirigeant vers le formulaire de commande.
13. **Avis Clients Vérifiés** : Grille avec note de 4.9/5 et témoignages. **Attention : ne pas dupliquer de texte sous les témoignages basés sur des images.**
14. **FAQ Interactive** : Questions/Réponses rétractables.
15. **Footer Officiel** : Mentions légales basiques.
16. **Barre Mobile Sticky CTA** : Composant `<StickyMobileCtaBar />` pour un appel à l'action permanent sur mobile.

---

## 🎯 3. Les 6 Piliers Fondamentaux de Chaque Landing Page

### 💎 Pilier 1 : Offre Unique (Single Offer)
- **Zéro sélecteur de packs multiples** (Duo, Trio, VIP, SD) sur la page principale.
- Le tableau `BUNDLES` contient **un seul et unique objet** représentant l'article à son prix fixe :
  ```typescript
  const BUNDLES: BundleOption[] = [
    {
      id: "solo",
      name: "Nom Officiel du Produit",
      subtitle: "Coffret complet avec accessoires officiels, câble et garantie",
      price: 14900,
      originalPrice: 25000,
      savings: 10100,
      quantity: 1,
      popular: true,
    },
  ];
  ```
- **Harmonisation intégrale du prix** : Le prix doit être identique partout (Header, CTA Vidéo, Formulaire, Sticky Bar, Meta Pixel).
- Les offres additionnelles (2ème unité) sont supprimées en faveur d'un suivi manuel WhatsApp.

### 📍 Pilier 2 : Emplacement Prioritaire du Formulaire de Commande (COD)
- Le composant `<UmeiStyleOrderSection />` DOIT être placé **immédiatement sous la galerie d'images Hero et les 3 badges de réassurance**.
- Pas d'excuses, pas de sections intermédiaires.

### 🔄 Pilier 3 : Carrousels à Défilement Automatique (Auto-Advancing)
- Si un carrousel d'images est utilisé (Galeries d'Exploration), il doit auto-défiler via `setInterval`.
- Le défilement doit être fluide avec pause au survol.

### ▶️ Pilier 4 : Lecture Automatique de la Vidéo (Autoplay)
- Toute vidéo de démonstration produit doit démarrer automatiquement :
  ```tsx
  <video
    src="/videos/demo.mp4"
    poster="/images/video-cover.jpg"
    autoPlay
    muted
    playsInline
    loop
    controls
    preload="auto"
    className="w-full h-full object-cover"
  />
  ```

### ☀️ Pilier 5 : Thème 100% Clair (Figma-Grade Light Mode)
- **Fond principal** : Blanc épuré `#FFFFFF` ou fond clair `#faf8fc`.
- Pas d'émojis dans les titres (Zéro AI-Slop), utiliser des icônes de Lucide React (`stroke-[1.75]`).

### ⚡ Pilier 6 : Intégration Meta & TikTok Pixel
- Utiliser `trackViewContent`, `trackAddToCart`, `trackInitiateCheckout`, et `trackPurchase` depuis `lib/metaPixel`.
- S'assurer que le routing vers la page de succès passe le nom, le numéro et le total dans l'URL pour l'attribution.

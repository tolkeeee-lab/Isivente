# 🎯 RÈGLE STRICTE : OFFRE UNIQUE (SINGLE OFFER) SUR TOUTES LES LANDING PAGES

## 🚫 1. Interdiction Formelle des Packs & Bundles Multiples
1. **PAS DE PACKS MULTIPLES (Solo / Duo / Trio / VIP / Packs avec accessoires)** sur les landing pages de vente.
2. Chaque page de vente présente **UNE SEULE ET UNIQUE OFFRE** pour le produit principal avec un prix clair, net et sans ambiguïté.
3. Les options de vente additionnelle (2ème exemplaire, accessoires) sont gérées **uniquement** dans les étapes d'Upsell / Downsell après la validation du premier formulaire, **JAMAIS** sous forme de sélecteur de packs sur la page principale.

---

## ✨ 2. Structure Standard du Panier / Formulaire
1. Le tableau `BUNDLES` ne doit contenir **qu'un seul objet** (l'offre unique) :
   ```typescript
   const BUNDLES: BundleOption[] = [
     {
       id: "solo",
       name: "[Nom Officiel du Produit]",
       subtitle: "Coffret complet avec tous les accessoires officiels et garantie",
       price: [Prix Fixe],
       originalPrice: [Prix Barré Réaliste],
       savings: [Économie],
       quantity: 1,
       popular: true,
     },
   ];
   ```
2. Le formulaire de commande (`UmeiStyleOrderSection`) affiche directement le produit et son prix sans cartes de sélection multiples.
3. Tous les boutons CTA (Header, Section Vidéo, Barre Flottante Mobile) sont strictement synchronisés sur cet unique prix.

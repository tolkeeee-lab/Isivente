---
name: isivente-clean-visual-assets
description: >-
  Protocole obligatoire de tri, sélection et intégration des images produits pour les landing pages Isivente.
  Impose une image Hero 100% épurée sans texte parasite, l'absence de texte redondant sous les visuels,
  et la gestion propre du stockage dans public/images/<slug>/.
---

# 🖼️ Isivente Clean Visual Assets Standard

Ce skill régit la sélection, l'organisation et l'affichage de toutes les photos produits envoyées par l'utilisateur lors de la création ou de la mise à jour d'une landing page.

---

## 🎯 1. Règle d'Or du Visuel Hero (Image N°1)

Lorsque l'utilisateur fournit plusieurs images pour un produit :
1. **Inspecter visuellement chaque image** avant de les ordonner.
2. **Sélectionner l'image la plus épurée** (mise en situation réaliste et valorisante, **sans gros texte publicitaire incrusté, sans flèches parasites, sans badges superposés**) comme **Image N°1 (`hero-clean.jpg`)** du carrousel principal.
3. **Ne jamais ajouter de badge circulaire ou de sticker HTML/CSS par-dessus l'image Hero** (garder la photo 100% dégagée sur mobile et desktop).

---

## 📐 2. Règle Stricte du Carrousel Hero (Exactement 5 Images) & Répartition des Visuels

Lorsque l'utilisateur fournit un lot d'images pour un produit :
1. **Carrousel Hero (Haut de page) = EXACTEMENT 5 VISUELS MAX :**
   Ne jamais saturer le carrousel avec 7, 8 ou 10 images. Sélectionner les 5 images les plus percutantes et les ordonner selon une logique de conversion narrative :
   * **Slide 1 :** L'Accroche Hero (produit sous son meilleur angle, mis en situation réelle).
   * **Slide 2 :** Polyvalence / Multi-zones / Bénéfice majeur pour l'utilisateur.
   * **Slide 3 :** Mode d'utilisation (mains libres, 2-en-1 ou manipulation concrète).
   * **Slide 4 :** Puissance / Modes / Personnalisation des réglages.
   * **Slide 5 :** Technologie, Batterie / Autonomie, Portabilité.
2. **Le reste des images fournies DOIT impérativement être distribué dans les sections éditoriales :**
   * **Section "Comment ça fonctionne ?" (Guide d'utilisation) :** Visuel montrant les étapes d'allumage ou les commandes.
   * **Section "Dimensions & Contenu du Coffret Officiel" :** Visuel montrant les mensurations précises et la liste des accessoires fournis dans la boîte.
   * **Section Bénéfices Comparatifs (`Classique vs Produit Isivente`) :** Visuel comparatif **Avant / Après** ou Différence de qualité.
   * **Section Guide Visuel / Infographie :** Visuel technique détaillant l'autonomie, les composants internes ou les certifications.
   * **Section Avis Clients :** Si les avis sont des captures ou des photos clients, **ne jamais dupliquer ce texte en légende HTML en dessous**.

---

## 🧹 3. Zéro Texte Redondant sous les Images

- Si une image comporte déjà un titre ou une explication visuelle claire, ne pas répéter le même texte juste en dessous dans le DOM.
- Les légendes doivent rester absentes ou ultra-sobres pour préserver un rendu e-commerce haut de gamme.

---

## 💾 4. Stockage & Prévention de Saturation Disque

1. Toujours ranger les visuels d'un nouveau produit dans un sous-dossier dédié : `public/images/<slug>/` avec des noms explicites en minuscules (`hero-clean.jpg`, `avant-apres.jpg`, `infographie.jpg`, etc.).
2. Si une erreur `ENOSPC` / `Espace insuffisant sur le disque` survient lors de la copie sous Windows, nettoyer immédiatement les fichiers temporaires obsolètes dans `$env:TEMP` (`C:\Users\...\AppData\Local\Temp`) avant de relancer la copie.


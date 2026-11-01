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

## 📐 2. Répartition Intelligente des Visuels par Section

Au lieu de mettre toutes les images au hasard au même endroit :
- **Carrousel Hero (Haut de page)** : 4 à 5 visuels esthétiques montrant le produit sous ses meilleurs angles et ambiances.
- **Section Bénéfices Comparatifs (`Classique vs Produit Isivente`)** : Utiliser le visuel comparatif **Avant / Après** s'il est fourni.
- **Section Guide Visuel / Infographie** : Utiliser le visuel technique détaillant l'autonomie, les dimensions ou les caractéristiques.
- **Section Avis Clients** : Si les avis sont des captures ou des photos avec texte intégré, **ne jamais dupliquer ce texte en légende HTML en dessous**.

---

## 🧹 3. Zéro Texte Redondant sous les Images

- Si une image comporte déjà un titre ou une explication visuelle claire, ne pas répéter le même texte juste en dessous dans le DOM.
- Les légendes doivent rester absentes ou ultra-sobres pour préserver un rendu e-commerce haut de gamme.

---

## 💾 4. Stockage & Prévention de Saturation Disque

1. Toujours ranger les visuels d'un nouveau produit dans un sous-dossier dédié : `public/images/<slug>/` avec des noms explicites en minuscules (`hero-clean.jpg`, `avant-apres.jpg`, `infographie.jpg`, etc.).
2. Si une erreur `ENOSPC` / `Espace insuffisant sur le disque` survient lors de la copie sous Windows, nettoyer immédiatement les fichiers temporaires obsolètes dans `$env:TEMP` (`C:\Users\...\AppData\Local\Temp`) avant de relancer la copie.

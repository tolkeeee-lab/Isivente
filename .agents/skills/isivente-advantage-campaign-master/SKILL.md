---
name: isivente-advantage-campaign-master
description: >-
  Standard d'ingénierie publicitaire Meta Ads en ciblage Advantage+ (Creative-Led Targeting)
  adapté au marché Cash-on-Delivery (COD) au Bénin et en Afrique de l'Ouest. Définit les
  contraintes de geofencing strictes, la structure de campagne, les signaux d'exclusion
  anti-touristes, le calibrage créatif éliminatoire, et l'apprentissage algorithmique sans bridage de CPM.
---

# 🚀 Isivente Advantage+ Campaign Master Standard (Meta Ads COD Bénin)

Ce standard formalise la stratégie, le paramétrage et la conduite des campagnes publicitaires Meta (Facebook & Instagram Ads) pour Isivente en exploitant la puissance du machine learning **Advantage+**, tout en le blindant contre les dérives spécifiques du marché Cash-on-Delivery (COD) en Afrique de l'Ouest.

---

## 🧠 1. Le Principe Fondamental : « En Advantage+, la Créative FAIT le Ciblage »

Dans l'écosystème publicitaire moderne de Meta (Andromeda / Advantage+), le ciblage par "centres d'intérêt" manuels est devenu secondaire. Meta analyse directement les **pixels de la vidéo**, **l'OCR des textes affichés** et **la transcription audio de la voix-off** pour décider à qui diffuser.

### La Règle du Filtre Qualifiant dès la Frame 0 (Matrice Cible Idéale Obligatoire) :
Avant de produire une seule créa vidéo ou voix-off pour un produit, il est **OBLIGATOIRE** de remplir la **Fiche Cible Idéale** et d'injecter ses signaux directement dans la vidéo :

1. **Définition de la Cible Idéale (Avatar Solvable)** :
   - **Qui paie réellement à Cotonou/Calavi ?** (ex: Hommes actifs 28–55 ans, mamans salariées, cadres, commerçants — jamais les 18–24 ans sans budget).
   - **Situation quotidienne exacte** : Le moment précis où le problème frappe (ex: *« Rentrer fatigué du travail à 19h à Cotonou »*).
2. **Call-Out Direct (0 à 3s)** : Nommer explicitement la cible idéale et son problème dès les 3 premières secondes à l'oral ET en gros texte à l'écran. Les hors-cibles (curieux, ados) décrochent en 0,5s ➔ Meta reçoit un signal pur et verrouille l'audience sur les vrais acheteurs.
3. **Le Prix Ferme Incrusté en Continu** : Afficher en permanence le montant officiel (ex: `14 900 FCFA`) dans un bandeau à fort contraste. L'internaute qui regarde et clique a validé le prix dans sa tête.
4. **La Zone de Livraison Délimitée** : Écrire clairement `LIVRAISON 24H COTONOU & CALAVI`. Les résidents des villes éloignées ne cliquent pas inutilement.
5. **La Réassurance COD** : Mentionner `PAIEMENT EN ESPÈCES APRÈS TEST` pour convertir les acheteurs hésitants.
6. **Validation Unit Economics Réels** : Avant de fixer le prix, vérifier que `Prix de vente − (Coût achat + 1 500 F livreur + 2 500 F pub + 500 F frais/retours) ≥ 4 000 FCFA net`.

---

## 🛡️ 2. Les 3 Seuls Garde-Fous Obligatoires de l'Ad Set (À Verrouiller Sans Faute)

L'IA de Facebook est surpuissante, mais elle est aveugle aux contraintes physiques de l'Afrique. Vous devez impérativement verrouiller ces 3 paramètres dans l'ensemble de publicités :

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      LES 3 GARDE-FOUS ISIVENTE                          │
├───────────────────────┬─────────────────────────────────────────────────┤
│ 1. Géofencing Strict  │ Cotonou (+10 km) et Abomey-Calavi (+10 km)      │
│                       │ ❌ Interdiction absolue de cocher "Tout le Bénin"│
├───────────────────────┼─────────────────────────────────────────────────┤
│ 2. Plancher d'Âge     │ 25 ans à 55+ ans (ou 28 à 55 ans selon produit) │
│                       │ ❌ Jamais de 18-24 ans (zéro pouvoir d'achat COD)│
├───────────────────────┼─────────────────────────────────────────────────┤
│ 3. Audience Suggestion│ "Acheteurs Actifs" (Engaged Shoppers)           │
│    (Advantage+)       │ + Intérêts ciblés du produit (Cuisine, Famille) │
└───────────────────────┴─────────────────────────────────────────────────┘
```

* **Placements** : **Décocher impérativement `Audience Network`** (source n°1 des faux clics accidentels dans les jeux mobiles au Bénin à 0,01 $ sans aucune intention d'achat). Garder uniquement **Fil Facebook, Reels Facebook, Stories Facebook, Fil & Reels Instagram**.

---

## 🏗️ 3. Structure & Nomenclature Standard Isivente

Chaque campagne doit respecter la nomenclature officielle pour alimenter dynamiquement le Dashboard Tracker interne (`/admin/tracker`) :

### 1. Niveau Campagne (*Campaign Level*)
* **Objectif** : Ventes (*Sales / Conversions*)
* **Optimisation** : Achat (*Purchase*) via Pixel Isivente (`2150878529184686`) + CAPI
* **Budget de test** : 10 $ / jour (environ 6 000 FCFA / jour)
* **Nom de la Campagne** :
  ```text
  [VENTES-COD] BJ_Cotonou-Calavi | [Nom_Produit] ([Prix]F)
  ```
  *Exemple : `[VENTES-COD] BJ_Cotonou-Calavi | Coupe-Legumes 14-en-1 (14 900F)`*

### 2. Niveau Ensemble de Publicités (*Ad Set Level*)
* **Nom de l'Ad Set** :
  ```text
  AdSet 01 | ADVANTAGE+ - Cotonou&Calavi (+10km) - [Age_Min]-[Age_Max]ans
  ```
  *Exemple : `AdSet 01 | ADVANTAGE+ - Cotonou&Calavi (+10km) - 25-55ans`*

### 3. Niveau Annonces (*Ad Level*)
Tester systématiquement **3 angles créatifs en concurrence dynamique** pour permettre à l'algorithme d'Advantage+ de ventiler le budget vers la créa qui convertit au plus bas coût d'acquisition :
* **AD 01** : `AD01_[Angle1] | Video-[Durée]s_Vivienne` *(ex: Vitesse / ASMR)*
* **AD 02** : `AD02_[Angle2] | Video-[Durée]s_Vivienne` *(ex: Épreuve de Force / Lames Inox)*
* **AD 03** : `AD03_[Angle3] | Video-[Durée]s_Vivienne` *(ex: Unboxing / Coffret Complet)*

### 4. Paramètre d'URL Dynamique Obligatoire
À coller dans le champ **Paramètres d'URL** de chaque publicité :
```text
utm_source=meta&utm_medium=paid&utm_campaign={{campaign.name}}&utm_content={{ad.name}}
```

---

## ⏱️ 4. La Règle des 72 Heures (Discipline Algorithmique)

La pire erreur en Advantage+ est de couper ou modifier une campagne au bout de quelques heures :
1. **Les 24 à 48 premières heures sont exploratoires** : Meta teste différentes micro-audiences à Cotonou et Calavi pour observer qui réagit. Les statistiques sont instables.
2. **Interdiction de toucher aux réglages pendant 72h** : Ne pas modifier le budget de plus de 20%, ne pas changer le ciblage, ne pas couper d'annonces.
3. **Le Seuil de Décision à J+3** :
   * Si **CPA < Marge cible (3 500 F)** ➔ Maintenir et augmenter le budget de 20 % tous les 2 jours.
   * Si **CTR < 1,5 %** ➔ Le Hook des 3 premières secondes n'accroche pas ; tester une nouvelle variante de vidéo.
   * Si **Visites > 100 mais 0 conversion** ➔ Vérifier la fluidité du formulaire et la cohérence de l'offre.

---

## 📲 5. La Règle du Closing Cash : Les Ventes se Font sur WhatsApp

En e-commerce Cash-on-Delivery, un visiteur qui commence à saisir ses coordonnées est un **acheteur potentiel à 80 %**.
Le système Isivente capture automatiquement ces coordonnées dès 8 chiffres saisis (`saveOrUpdateLead`) :

1. **Relevé Quotidien Obligatoire** : Vérifier chaque matin à 08h30 les prospects enregistrés dans Supabase (`leads`).
2. **Prise de Contact Ultra-Personnalisée** : Ne jamais attendre que le prospect revienne sur le site. Lui envoyer un message WhatsApp mentionnant son nom, son quartier et le produit.
3. **Confirmation avant Envoi Coursier** : Le livreur ne démarre sa moto que lorsque le client a répondu et confirmé être présent avec le montant exact en espèces.

---

## 🏦 6. Protocole « Zéro Visiteur Perdu » (Capitalisation & Retargeting)

Chaque visiteur amené sur `isivente.com` a été payé en budget publicitaire : il constitue un actif financier à conserver à 100 %.

1. **Coffre-fort Meta Pixel & CAPI (Conservation 180 jours)** :
   - Tous les visiteurs sont automatiquement enregistrés par le Pixel (`2150878529184686`) + CAPI dès l'arrivée sur la page.
   - Créer et maintenir dans Ads Manager les 3 Audiences Personnalisées permanentes :
     - `Visiteurs isivente.com (180 jours)`
     - `Vues Produit / ViewContent (30 jours)`
     - `Paniers / AddToCart & InitiateCheckout (30 jours)`
   - Utiliser ces audiences pour des campagnes de **Retargeting** (re-présenter l'offre ou lancer un nouveau produit à moindre coût).
2. **Coffre-fort WhatsApp (Actif 100% Propriétaire & Gratuit à Vie)** :
   - Sur le site : proposer une capture WhatsApp active (bouton d'assistance directe + pop-up d'abandon `<ExitIntentModal />` + capture de prospects dans Supabase `leads`).
   - Enregistrer systématiquement dans son répertoire téléphone chaque prospect qui écrit ou laisse son numéro (`Client_Cotonou_XXX`) pour que tous les futurs **Statuts WhatsApp** génèrent des ventes organiques à **0 FCFA de pub**.

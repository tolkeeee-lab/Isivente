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

### La Règle du Filtre Qualifiant dès la Frame 0 :
Si l'on laisse Facebook en Advantage+ avec une pub floue ou sensationnaliste, l'algorithme optimise vers le coût par clic le moins cher (adolescents, curieux sur Facebook Lite).
Pour forcer l'algorithme à ne chercher **QUE des acheteurs sérieux et solvables**, chaque créa DOIT comporter :

1. **Un Hook Éliminatoire (0 à 3s)** : Interpeller le rôle responsable du prospect (ex: *« Vous cuisinez tous les soirs pour votre famille après le boulot ? »*). Les personnes hors cible décrochent immédiatement.
2. **Le Prix Ferme Incrusté en Continu** : Afficher en permanence le montant officiel (ex: `14 900 FCFA`) dans un bandeau à fort contraste. L'internaute qui regarde et clique a validé le prix dans sa tête.
3. **La Zone de Livraison Délimitée** : Écrire clairement `LIVRAISON 24H COTONOU & CALAVI`. Les résidents des villes éloignées ne cliquent pas inutilement.
4. **La Réassurance COD** : Mentionner `PAIEMENT EN ESPÈCES APRÈS TEST` pour convertir les acheteurs hésitants.

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

* **Placements** : Laisser en **Advantage+ Placements** (recommandé). Le filtre de la créative et le plancher d'âge suffisent à assainir l'audience sans provoquer l'explosion artificielle du CPM que causent les placements manuels forcés.

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

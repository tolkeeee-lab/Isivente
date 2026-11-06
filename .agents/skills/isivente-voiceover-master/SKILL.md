---
name: isivente-voiceover-master
description: >-
  Standard de rédaction et de paramétrage de voix-off publicitaires vidéo (TikTok, Meta Ads, YouTube Shorts)
  pour Isivente. Définit le persona vocal Vivienne avec intensité, les réglages TTS ElevenLabs/CapCut,
  le calibrage temporel exact au timing de la vidéo, et les déclencheurs de conversion Cash-on-Delivery (COD).
---

# 🎙️ Isivente Voice-Over Master Standard (Voix Vivienne & Scripts Publicitaires)

Ce document formalise les règles obligatoires pour la conception, l'écriture et le paramétrage des voix-off publicitaires d'Isivente destinées aux vidéos courtes (TikTok Ads, Meta Reels, YouTube Shorts).

---

## 🎭 1. Le Persona Vocal : "Vivienne avec Intensité"

La voix **Vivienne** incarne une femme moderne, affirmée, énergique et complice. Elle ne "lit" pas un texte, elle interpelle directement l'automobiliste ou l'acheteur avec autorité et enthousiasme.

### Principes d'interprétation :
1. **Intensité dès la 1ère seconde** : Le premier mot doit percer l'écran pour stopper le scroll immédiatement (Pattern Interrupt).
2. **Rythme soutenu sans temps mort** : Entre 2,5 et 3 mots par seconde pour maintenir l'attention.
3. **Micro-pauses dramatiques** : Utiliser des points (`.`) et tirets (`—`) pour forcer des respirations courtes avant les révélations clés.
4. **Mots accentués en MAJUSCULES** : Écrire les mots percutants en majuscules dans le prompt TTS pour forcer une inflexion tonique marquée (ex: `STOP`, `ZÉRO FIL`, `REGARDE ÇA`).

---

## 🎛️ 2. Paramétrage Technique ElevenLabs / CapCut TTS

Pour reproduire fidèlement l'énergie vive et percutante de Vivienne :

* **Voix** : Vivienne (French female voice)
* **Modèle** : `Eleven Multilingual v2` ou `Eleven Turbo v2.5`
* **Stability** : `35% – 40%` *(Une stabilité plus basse libère les émotions, évite la voix robotique monotone et donne des variations d'intonation naturelles)*
* **Similarity / Clarity** : `80% – 85%` *(Préserve le timbre chaud et distinct de Vivienne)*
* **Style Exaggeration** : `20% – 25%` *(Accentue l'intention publicitaire et l'impact commercial)*
* **Speaker Boost** : `Activé` *(Augmente la clarté et la présence dans les aigus/médiums pour smartphone)*

---

## ⏱️ 3. Règle du Calibrage Temporel Strict

Un script ne doit jamais être trop court (laissant un silence gênant sur la vidéo) ni trop long (obligeant à accélérer la voix de façon inintelligible).

* **Calcul de la longueur du texte** :
  $$\text{Nombre de mots recommandés} \approx \text{Durée de la vidéo (en secondes)} \times 2{,}7$$
  - Exemple pour une vidéo de **39 secondes** : $\approx 105$ à $115$ mots au total.
  - Exemple pour une vidéo de **25 secondes** : $\approx 65$ à $75$ mots au total.
  - Exemple pour une vidéo de **15 secondes** : $\approx 40$ à $45$ mots au total.

---

## 📐 4. Structure en 4 Étapes d'un Script Isivente

Chaque script publicitaire doit respecter cette hiérarchie narrative :

1. **Le Hook (0 à 4s)** : Interpellation directe ou mise en scène du problème agaçant.
2. **La Révélation Produit (4 à 15s)** : Présentation visuelle immédiate de la solution (effet "Wow").
3. **Les Bénéfices Concrets (15 à 30s)** : Démonstration en action (fonctionnement, propreté, parfum, charge rapide).
4. **Le Call-to-Action COD Bénin (30s à fin)** : Urgence, garantie, et réassurance locale absolue (*Paiement à la livraison après vérification*).

---

## 🇧🇯 5. Règle Locale COD (Bénin)

Ne jamais oublier d'ancrer la fin du script dans la réalité d'achat locale :
- Mentionner clairement : **« Livraison express partout au Bénin »**
- Réassurance clé : **« Vous ne payez qu'à la réception, après avoir testé votre appareil »**
- Appel à l'action : **« Cliquez vite sur le lien sous la vidéo pour commander »**

---

## 🎵 6. Règle de l'Intensité Non-Stop (Musique de Fond Obligatoire)

Une voix-off publicitaire ne doit **JAMAIS** être livrée sans musique de fond (« dry voice ») :
1. **Musique continue de 0:00 à la dernière frame** : Un beat moderne, commercial ou tech house rythmé doit porter la vidéo du début à la fin sans interruption.
2. **Duck sonore équilibré** : Le volume de la musique de fond est calé à **18% - 22%**, tandis que la voix de Vivienne est boostée à **140% - 145%** avec `normalize=0` dans FFmpeg (`amix=inputs=2:dropout_transition=0:normalize=0`).
3. **Fondu doux à la fin** : L'audio se conclut avec un fade-out doux de 1,0s à 1,2s sur le CTA final (`afade=t=out:st=...:d=1.2`).

---

## ✂️ 7. Règle du Recadrage Temporel (Zéro Fin Morte)

Si la voix s'achève avant la fin de la vidéo brute :
1. **Interdiction de laisser traîner la vidéo** : Ne jamais laisser des secondes muettes ou répétitives flotter après le CTA.
2. **Recadrage temporel à la milliseconde** : Couper la vidéo (`-t <durée>`) au moment exact où la voix de Vivienne termine son appel à l'action et que la musique atteint son climax (ex: 32.0s pile).
3. **Format court punchy recommandé (28s - 34s)** : Condenser le script en 6 à 7 punchlines percutantes pour maximiser le taux de complétion (VTR) et la conversion publicitaire.

---

## 💰 8. Harmonisation Absolue du Prix

Le prix annoncé doit être **strictement identique** dans tous les éléments de la création :
- Dans la voix-off : prononcé distinctement (ex: « 16 900 Francs »).
- Dans le sous-titre cinématique : affiché en toutes lettres (« 16 900 FCFA »).
- Dans le badge promo clignotant / fixe : bandeau doré ambre (`PRIX PROMO EXCLUSIF : 16 900 FCFA`).
- Sur la landing page et le formulaire de commande associé.



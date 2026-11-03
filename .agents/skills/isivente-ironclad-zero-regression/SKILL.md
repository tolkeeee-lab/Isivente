---
name: isivente-ironclad-zero-regression
description: >-
  Standard d'ingénierie suprême pour Isivente : Blindage absolu des fonctionnalités validées,
  interdiction formelle du code à l'aveugle, zéro dette technique, et protocole strict d'intégrité
  pour garantir qu'aucune modification ne casse l'existant.
---

# 🛡️ Isivente Ironclad Zero-Regression (Blindage Suprême & Qualité Professionnelle)

Ce document constitue la **loi suprême d'ingénierie** pour toute intervention sur le codebase Isivente.
Il répond à une exigence non négociable : **Garantir que ce qui marche ne soit JAMAIS cassé, interdire les modifications à l'aveugle, et appliquer systématiquement des solutions d'architecture professionnelles sans dette technique.**

---

## 🛑 1. Les 5 Commandements Absolus

1. **JAMAIS de modification à l'aveugle** :
   - Avant de toucher à un composant ou un fichier, lire son contenu complet et comprendre ses dépendances amont et aval.
   - Ne jamais deviner un nom de table, un nom de colonne, un slug produit, une route ou une variable d'environnement sans vérification préalable dans le code ou la base.

2. **Blindage Absolu de la "Zone Rouge"** :
   - Les fonctionnalités éprouvées et validées (qui convertissent et génèrent du chiffre d'affaires) sont sanctuarisées.
   - Toute modification sur ces composants doit être chirurgicale, ciblée, et testée immédiatement.

3. **Zéro Dette Technique & Zéro Patch Temporaire** :
   - Pas de code spaghetti, pas de hacks "pour que ça marche vite", pas de `any` injustifié.
   - Typage TypeScript strict et exhaustif.
   - Gestion défensive des erreurs avec `try/catch` explicites et retours utilisateurs clairs.

4. **Résolution à la Racine Uniquement (Root-Cause Only)** :
   - Si un dysfonctionnement apparaît, interdiction formelle d'ajouter une rustine "par-dessus". Identifier la cause première dans le fichier source, réparer sur place, et nettoyer le code mort.

5. **Validation Systématique Post-Intervention (Pre-Flight Check)** :
   - Après chaque modification de code, exécuter obligatoirement le script d'intégrité :
     `node .agents/skills/isivente-ironclad-zero-regression/scripts/verify-integrity.js`
   - Le build de production Next.js doit rester au vert (0 erreur de compilation, 0 erreur de type).

---

## 🏛️ 2. Cartographie de la "Zone Rouge" (Ce qui ne doit JAMAIS casser)

Ces modules représentent le cœur économique d'Isivente. Ils fonctionnent actuellement en production et sont sous haute protection :

```
[Visiteur Publicité Meta / TikTok]
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 1. ROUTE PRODUIT DÉDIÉE : app/p/[slug]/page.tsx         │
│    - Chargement instantané (< 1s Edge)                  │
│    - Vidéo produit muette en boucle (Pilier Autoplay)   │
└─────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────┐
│ 2. FORMULAIRE COD ULTRA-CONVERTISSEUR                   │
│    components/features/UmeiStyleOrderSection.tsx        │
│    - Offre Unique (Pilier Single Offer)                 │
│    - Formulaire 1-clic : Nom + Téléphone + Ville Bénin │
│    - Zéro panier intermédiaire                          │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────────┐  ┌───────────────────────────────────┐
│ CAPTURE DE LEAD  │  │ COMMANDE FERME (Cash-on-Delivery) │
│ (Dès la saisie   │  │ POST /api/orders                  │
│  du numéro)      │  │ - Insertion SQL table `orders`    │
│ lib/leadsStorage │  │ - Déduplication CAPI Meta Serveur │
│ Table `leads`    │  │ - Notification Email / Push       │
└──────────────────┘  └─────────────────┬─────────────────┘
                                        │
                                        ▼
                      ┌───────────────────────────────────┐
                      │ 3. PAGE DE SUCCÈS & ATTRIBUTION   │
                      │ app/p/[slug]/success/page.tsx     │
                      │ - Tir de l'événement Purchase     │
                      │   (dédupliqué event_id = order_no)│
                      │ - Redirection WhatsApp automatique│
                      │   vers le numéro du closing       │
                      └───────────────────────────────────┘
```

---

## 🧠 3. Protocole Anti-Perte de Contexte (Anti-Drift)

Pour éviter que l'agent ne se perde au fil des messages et conserve une vision claire à 360° :

1. **Rappel d'État Systématique** :
   À chaque étape de développement, maintenir une vision nette :
   * Quel est l'état actuel de la branche (`git status`) ?
   * Quel fichier est modifié et pourquoi ?
   * Quelle est la conséquence sur le reste du tunnel ?

2. **Focalisation sur l'Objectif Utilisateur** :
   * Répondre strictement et précisément à la demande sans digression inutile.
   * Proposer la meilleure solution architecturale possible avant d'écrire du code.

3. **Check-list Pré-Modification** :
   * [ ] Le fichier cible a-t-il été lu entièrement ?
   * [ ] Les imports et types existants sont-ils respectés ?
   * [ ] Existe-t-il déjà une fonction utilitaire pour cela dans `lib/` (vérifier `isivente-function-registry-guard`) ?
   * [ ] Le catalogue central `lib/defaultCatalog.ts` est-il préservé comme source unique de vérité ?

---

## ⚙️ 4. Script d'Intégrité Automatisé

Le script `.agents/skills/isivente-ironclad-zero-regression/scripts/verify-integrity.js` valide :
1. L'intégrité des fichiers critiques (`defaultCatalog.ts`, `UmeiStyleOrderSection.tsx`, `orders/route.ts`, etc.).
2. La présence et la structure des tables Supabase (`orders`, `leads`, `analytics`, `products`).
3. La non-régression du catalogue (prix, slugs, devises).
4. La compilation TypeScript (`tsc --noEmit` ou validation de syntaxe).

Exécution :
```bash
node .agents/skills/isivente-ironclad-zero-regression/scripts/verify-integrity.js
```
Tout déploiement ou validation de tâche est conditionné au passage au vert de ce script.

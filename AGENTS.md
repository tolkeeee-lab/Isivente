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
5. **Image Hero ou Carrousel (Règle Stricte des 5 Images Max)** : Une image mise en avant ou un carrousel d'images avec défilement automatique (qui s'arrête au survol). Le carrousel Hero doit comporter EXACTEMENT 5 images ordonnées narrativement (Accroche ➔ Polyvalence ➔ Mode 2-en-1 ➔ Niveaux ➔ Technologie) ; les autres visuels sont répartis dans les sections du site ("Comment ça fonctionne ?", "Dimensions & Contenu du Coffret", etc.). Aucun sticker ni badge circulaire superposé sur l'image (garder un visuel épuré sans obstruction) et éviter le texte inutile en dessous des images.
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
17. **Pop-up d'Abandon Intelligent (Exit Intent & Objections WhatsApp)** : Composant `<ExitIntentModal slug={slug} />` systématiquement monté sur la page. Il intercepte les départs (souris haute sur desktop, bouton retour sur mobile), propose 4 résolutions d'objections en 1-clic redirigeant vers WhatsApp avec un message pré-rempli, ainsi qu'un champ libre pour toute question personnalisée.

---

## 🎯 3. Les 7 Piliers Fondamentaux de Chaque Landing Page

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

### 📲 Pilier 7 : Filet de Sauvetage & Capture d'Objections WhatsApp (Exit Intent)
- **Composant obligatoire** : `<ExitIntentModal slug={slug} />` actif sur chaque route produit.
- **Rôle CRO** : Ne pas laisser partir un visiteur indécis dans le silence.
- **Fonctionnement** :
  1. Interception du départ (mouvement vers le haut sur PC, appui sur retour sur mobile).
  2. 4 objections 1-clic pré-rédigées (Prix/Ristourne, Faisabilité/Délai livraison ville, Qualité/Garantie, Commande directe).
  3. Champ libre si la question du client n'est pas dans la liste.
  4. Redirection automatique vers WhatsApp (`wa.me`) avec le produit et la question pré-remplis pour engager la vente en direct.

### 🚀 Pilier 8 : Performance Mobile 90+ & Vitesse Instantanée (Anti-Perte 95%)
Sur les réseaux mobiles d'Afrique de l'Ouest (MTN / Moov 3G/4G), toute seconde de latence fait fuir 90%+ des acheteurs avant même que le Pixel ne s'allume.
Chaque landing page et chaque composant DOIT impérativement respecter les règles de vitesse suivantes :
1. **Poids Max des Images (< 100 Ko par image, < 800 Ko pour toute la page)** :
   - Toujours compresser avec MozJPEG progressif (`sharp`) à `quality: 78`, redimensionné à max 960x960.
   - Activer nativement `formats: ['image/avif', 'image/webp']` dans `next.config.mjs`.
2. **Chargement Différé des Visuels Secondaires (`loading="lazy"`)** :
   - Seule l'image Hero principale au-dessus de la ligne de flottaison est en `priority`.
   - Toutes les miniatures de carrousel et images des sections éditoriales DOIVENT porter `loading="lazy"`.
3. **Exécution Instantanée du Pixel Meta dans le `<head>`** :
   - Ne JAMAIS charger le Pixel Meta en `afterInteractive`.
   - Le script de base du Pixel est injecté directement dans le `<head>` avec balise `<noscript>`.
   - Toujours pré-connecter les serveurs Meta dès le premier octet (`preconnect` et `dns-prefetch` vers `connect.facebook.net`).
   - Le signal `PageView` part ainsi vers Meta **en moins de 200 ms**, garantissant un taux de rétention clics ➔ visites > 85%.
4. **Code-Splitting Modulaire (`next/dynamic`)** :
   - Dans `app/p/[slug]/page.tsx`, chaque landing page produit est importée dynamiquement via `dynamic(() => import(...))` pour ne JAMAIS embarquer le code des autres produits dans le bundle du produit visité.
5. **Délestage des Outils Tiers (Clarity en `lazyOnload`)** :
   - Microsoft Clarity ou tout script lourd doit être chargé en `strategy="lazyOnload"` pour ne pas voler un seul cycle de processeur mobile au moment de l'affichage.

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

---

## 🛡️ 4. Règle Absolue d'Ingénierie : Zéro Doublon & Blindage Anti-Régression (Ironclad Standard)

Consulter et appliquer obligatoirement :
- `.agents/skills/isivente-ironclad-zero-regression/SKILL.md` (Loi suprême de blindage & intégrité)
- `.agents/skills/isivente-anti-doublon-root-cause/SKILL.md`
- `.agents/skills/isivente-function-registry-guard/SKILL.md`
- `.agents/skills/isivente-meta-capi-attribution-guard/SKILL.md`
- `.agents/skills/isivente-single-source-catalog/SKILL.md`
- `.agents/skills/isivente-clean-visual-assets/SKILL.md`
- `.agents/skills/isivente-whatsapp-cod-closing/SKILL.md`
- `.agents/skills/isivente-irresistible-offer-master/SKILL.md`
- `.agents/skills/isivente-advantage-campaign-master/SKILL.md`
- `.agents/skills/isivente-cod-sales-playbook/SKILL.md` (Playbook scientifique mondial de vente COD adapté au Bénin)
- `.agents/skills/unslop-ui/SKILL.md` (Standard de finition UI sans tics IA)
- `DESIGN.md` (Système de design officiel Isivente : vert forêt `#14281D`, terracotta `#E8643C`, crème `#F8F5EE`, graphite `#FAFAFA`)

0. **Blindage Absolu & Interdiction du Code à l'Aveugle** :
   - Tout ce qui fonctionne (Zone Rouge : tunnel de commande, CAPI, capture de leads, lecture vidéo) est sanctuarisé.
   - Ne JAMAIS modifier un fichier sans l'avoir lu entièrement et vérifié ses dépendances.
   - Toujours exécuter `node .agents/skills/isivente-ironclad-zero-regression/scripts/verify-integrity.js` et `npm run build` pour valider qu'aucune régression n'a été introduite.

1. **Ne jamais empiler une solution "par-dessus" un bug ni recréer une fonction existante** :
   - Avant d'écrire n'importe quelle fonction, vérifier dans `.agents/skills/isivente-function-registry-guard/SKILL.md` (ou via `node .agents/skills/isivente-function-registry-guard/scripts/check-functions.js`) si elle existe déjà dans `lib/` ou `hooks/`.
   - Si une fonctionnalité (Pixel, CAPI, Analytics, Bot, Route API, fonction utilitaire) ne fonctionne pas, diagnostiquer la cause racine dans le fichier existant, la corriger sur place et supprimer tout code redondant.
2. **Zéro Doublon d'Événements Meta Pixel / CAPI** :
   - Tous les événements navigateur + pont CAPI passent exclusivement par `lib/metaPixel.ts` (verrouillés par `getSessionEventLock` : 1 seul événement par type et par session).
   - Les clés et tokens (`META_CONVERSIONS_API_TOKEN`, `NEXT_PUBLIC_META_PIXEL_ID`) sont configurés directement dans l'environnement **Vercel Production**.
   - Aucun composant ne doit appeler `/api/pixel/event` en direct.
   - Pour `Purchase` : 1 seul envoi Serveur CAPI dans `app/api/orders/route.ts` (avec `await`) + 1 seul envoi Navigateur `fbq` sur `app/p/[slug]/success/page.tsx` partageant le même `event_id = order_number`.
3. **Zéro Doublon Visiteurs / Leads / Commandes** :
   - Visiteurs comptés uniquement dans `hooks/usePagePresence.ts` (session unique de 6h par produit).
   - Paniers abandonnés dédupliqués par `lead_{phone}_{slug}`.
   - Ne jamais écraser `product_slug` par `"umei"` dans `app/api/orders/route.ts`.
4. **Catalogue Source Unique (`lib/defaultCatalog.ts`)** :
   - Chaque produit est défini une seule fois dans `lib/defaultCatalog.ts` avec `accentColor` et `keywords`.
   - `components/features/UmeiStyleOrderSection.tsx` calcule dynamiquement toute la palette du formulaire via `buildDynamicTheme(accentColor)` (ne jamais recréer de dictionnaire `THEME_PALETTES`).
   - `lib/whatsappAgent.ts` lit automatiquement `keywords`, `slug` et `shortTitle` depuis `DEFAULT_CATALOG` (ne jamais recréer de liste `PRODUCT_KEYWORDS` séparée).
5. **Audit Sécurité Obligatoire des Skills Externes (NVIDIA SkillSpector)** :
   - Avant d'installer ou d'exécuter tout nouveau skill provenant de GitHub ou d'une source externe, lancer obligatoirement :
     `& "$env:USERPROFILE\.local\bin\skillspector.exe" scan <URL_OU_DOSSIER> --no-llm`
   - Bloquer immédiatement l'installation en cas d'alerte `HIGH` ou `CRITICAL` (injection de prompt, exfiltration de clés, script malveillant) et présenter le rapport à l'utilisateur.


# 🚨 RÈGLE OBLIGATOIRE : CONSULTATION PRÉALABLE DU MASTER STANDARD ISIVENTE

Avant toute création ou modification d'une page de vente ou landing page, l'agent **DOIT IMPÉRATIVEMENT** appliquer la checklist suivante sans exception :

1. **OFFRE UNIQUE OBLIGATOIRE (SINGLE OFFER)** :
   - Strictement **1 seul article** dans le tableau `BUNDLES`.
   - BANNIR formellement les sélecteurs de packs multiples (Duo, Trio, VIP).
   - Prix unique identique partout (Header, Vidéo, Formulaire, Sticky Bar, WhatsApp, Meta Pixel).
   - Les offres additionnelles (2ème unité) sont gérées uniquement en Upsell / Downsell après validation.

2. **EMPLACEMENT DU FORMULAIRE DE COMMANDE (COD)** :
   - Le formulaire (`#commander` / `UmeiStyleOrderSection`) doit être positionné **directement sous le carrousel d'images Hero et les 3 badges de réassurance** (au sommet de la page).

3. **CARROUSELS AUTO-DÉFILANTS (AUTO-ADVANCE)** :
   - Le carrousel Hero doit défiler automatiquement toutes les ~3.8 secondes avec pause au survol et boutons de navigation gauche/droite.
   - Les galeries de photos d'exploration (TikTok / médias sociaux) doivent défiler automatiquement avec pause au survol et boutons fléchés.

4. **AUTOPLAY VIDÉO** :
   - Les vidéos de démonstration doivent inclure `autoPlay`, `muted`, `playsInline`, `loop`, `controls` pour démarrer instantanément tout en laissant le contrôle de pause à l'utilisateur.

5. **THÈME 100% CLAIR (LIGHT MODE)** :
   - BANNIR les fonds noirs ou sombres (`bg-slate-950`, `bg-gray-900`).
   - Utiliser exclusivement des surfaces blanches biseautées (`bg-white` avec ombres fines et liserés `border-slate-200`).

6. **AUTO-BUILD & PUSH GIT** :
   - Compiler avec `npm run build` (0 erreur).
   - Commit et push automatique sur `origin/main`.

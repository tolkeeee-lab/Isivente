# Isivente — DESIGN.md (Système de Design Officiel)

Ce fichier définit l'identité visuelle unique d'Isivente pour toutes les interfaces (vitrine SaaS, authentification, espace vendeur Admin et pages produits COD). Il complète `AGENTS.md` et `.agents/skills/unslop-ui/SKILL.md`.

---

## 1. Identité & Direction
- **Produit** : Plateforme e-commerce Cash-on-Delivery (COD) conçue pour les vendeurs d'Afrique francophone.
- **Caractère** : Calme, exact, terrain, ancré.
- **Monde** : Carnet de caisse, bordereau de livraison et marché moderne — papier crème chaud en vitrine, graphite neutre en tableau de bord, encre vert forêt franche, une touche terracotta unique inspirée du point du logo.
- **Logo officiel** :
  - Vitrine / Auth / Fonds clairs : `/brand/isivente-logo-couleur.svg`
  - Fonds sombres : `/brand/isivente-logo-blanc.svg`
  - Icône carrée / Sidebar fondateur / PWA : `/brand/isivente-icone-app.svg` et `/brand/isivente-symbole-couleur.svg`

---

## 2. Palette Officielle

### Couleurs de Marque (issues du logo)
| Rôle | Hex | Usage |
| :--- | :--- | :--- |
| **Vert Forêt (Primaire)** | `#14281D` | Boutons principaux, encre forte vitrine, `theme_color` PWA |
| **Vert Forêt Hover** | `#1E3A2B` | Survol des boutons primaires |
| **Terracotta (Signature)** | `#E8643C` | Accent signature rare (point du logo, repère d'alerte ou indicateur clé — max 1 à 2 par écran) |
| **Vert Encaissement (COD)** | `#15803D` | Argent encaissé réel, confirmation livraison, actions WhatsApp COD |
| **Rouge Sémantique** | `#DC2626` | Erreurs, suppression définitive, boutique en pause |

### Rampe Vitrine & Auth (Papier Chaud)
| Rôle | Hex |
| :--- | :--- |
| Fond de page | `#F8F5EE` |
| Surface carte | `#FDFBF7` |
| Surface surélevée / input / onglet actif | `#EFE9DF` |
| Filet / bordure | `rgba(20, 40, 29, 0.09)` (`border-black/[0.08]`) |
| Texte primaire | `#14281D` (ou `#1F1B16`) |
| Texte secondaire | `#5E554A` |
| Texte discret / méta | `#7B7266` |

### Rampe Espace Vendeur Admin (Graphite Clair)
| Rôle | Hex |
| :--- | :--- |
| Fond de page | `#FAFAFA` |
| Surface carte & sidebar | `#FFFFFF` |
| Surface active / survol / input | `#F4F4F5` |
| Filet / bordure | `rgba(0, 0, 0, 0.08)` (`border-black/[0.08]`) |
| Texte primaire | `#171717` |
| Texte secondaire | `#525252` |
| Texte discret / icônes | `#737373` |

### Pages Produits Vendeurs (`/p/[slug]`)
- Fond blanc `#FFFFFF` + surfaces `#FAFAFA` / `#F4F4F5` (thème 100 % clair obligatoire).
- Accent dynamique unique fourni par `storeConfig.accent_color` (défaut `#15803D`).

---

## 3. Typographie
- **Police principale** : `Plus Jakarta Sans` (`--font-jakarta`).
- **Police chiffres & méta** : `font-mono tabular-nums` obligatoire sur tous les montants en FCFA, compteurs, pourcentages et numéros de commande.
- **Graisses autorisées** : `400` (`font-normal`) et `500` (`font-medium`), exceptionnellement `600` (`font-semibold`). **Jamais** de `font-extrabold` (800) ni `font-black` (900).
- **Casse** : *Sentence case* partout (ex. `Opérations`, `Produits et trafic`, `Total boutique`). **Jamais** de labels en `UPPERCASE` avec fort `tracking-wider`.
- **Échelle** :
  - Hero vitrine : `38px–58px`, `leading-[1.05]`, `tracking-[-0.03em]`, `font-medium`
  - Titre de page Admin : `28px`, `leading-[1.15]`, `tracking-[-0.02em]`, `font-medium`
  - Chiffre KPI : `26px–28px`, `leading-none`, `font-medium font-mono tabular-nums`
  - Corps & navigation : `14px`, `leading-[1.45]`
  - Méta & légendes : `12px–13px`

---

## 4. Espacements, Rayons & Profondeur
- **Grille stricte `4px`** : `4, 8, 12, 16, 20, 24, 32, 48, 64, 80`. Aucune valeur arbitraire (`mt-[13px]`, etc.).
- **Rayons imbriqués (`inner = outer - padding`)** :
  - Conteneurs / cartes : `14px` (`rounded-[14px]`)
  - Boutons, champs, lignes actives : `8px` (`rounded-[8px]`)
  - Petits tags / compteurs : `6px` (`rounded-[6px]`)
- **Ombres** : neutres et discrètes uniquement (`0 1px 2px rgba(0,0,0,0.05)` sur les cartes, `0 12px 32px rgba(20,40,29,0.12)` sur les éléments flottants). Jamais d'ombre colorée ni de lueur (`glow`).

---

## 5. Composants, Icônes & Mouvement
- **Icônes** : `lucide-react` uniquement, `16px` (`w-4 h-4`), `stroke-[1.5]`, couleur neutre `#737373` (ou `#171717` actif). Zéro emoji dans l'interface. Zéro icône décorative dans les cartes KPI chiffrées.
- **Statuts** : pastille discrète `6px` (`w-1.5 h-1.5 rounded-full`) + texte sobre, jamais de badges criards.
- **Transitions** : `transition-colors duration-150` ou `transition-[opacity,transform] duration-150`. **Interdit** : `transition-all`, `animate-pulse`, `animate-ping`, `hover:scale`.
- **Copywriting** : phrases courtes et factuelles en français, zéro point d'exclamation, zéro point final sur les titres/boutons/labels courts.

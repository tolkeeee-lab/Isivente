# Isivente

Syst?me moderne de gestion de point de vente (POS), suivi des stocks et analyse financi?re.

## ?? Stack Technique
- **Framework :** Next.js 15 (App Router)
- **Language :** TypeScript
- **Styling :** Tailwind CSS
- **Icons :** Lucide React

## ?? Architecture du Projet
```
??? app/                  # Routes & Pages (Next.js App Router)
?   ??? api/              # API endpoints (REST)
?   ??? layout.tsx        # Root layout & m?tadonn?es globales
?   ??? page.tsx          # Page d'accueil / Dashboard
?   ??? globals.css       # Styles globaux & tokens Tailwind
??? components/           # Composants r?utilisables
?   ??? ui/               # Composants atomiques (Button, Card, Input)
?   ??? layout/           # Structure globale (Navbar, Sidebar)
?   ??? features/         # Composants m?tiers (POS, Stock, Analytics)
??? lib/                  # Logique partag?e, types et helpers
?   ??? types/            # D?finitions TypeScript
?   ??? utils.ts          # Utilitaires de formatage et classes
??? public/               # Fichiers statiques et m?dias
```

## ??? D?marrage Local
```bash
npm install
npm run dev
```

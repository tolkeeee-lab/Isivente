export interface ProductBundle {
  name: string;
  price: number;
}

export interface CatalogProduct {
  id: string;
  title: string;
  shortTitle?: string;
  slug: string;
  price: number;
  image_url: string;
  image?: string;
  headline?: string;
  bundles: ProductBundle[];
}

export const DEFAULT_CATALOG: CatalogProduct[] = [
  {
    id: "duo-bracelets-coeur-default",
    title: "Coffret Cadeau Écrin Duo de Bracelets Cœurs Dorés Ajustables",
    shortTitle: "Duo Bracelets Cœurs Dorés",
    slug: "duo-bracelets-coeur",
    price: 14900,
    image_url: "/images/bracelets-coeur/bracelet-duo-partager.jpg",
    image: "/images/bracelets-coeur/bracelet-duo-partager.jpg",
    headline: "Deux designs précieux, un même éclat d'amour : coffret cadeau de luxe avec deux bracelets cœurs dorés ajustables.",
    bundles: [
      { name: "Coffret Cadeau Écrin Duo de Bracelets Cœurs Dorés Ajustables", price: 14900 }
    ]
  },
  {
    id: "voiture-camera-default",
    title: "Voiture Télécommandée de Course avec Caméra HD & Manette Écran FPV",
    shortTitle: "Voiture Télécommandée Caméra HD",
    slug: "voiture-camera",
    price: 29900,
    image_url: "/images/voiture-slide-salon.jpg",
    image: "/images/voiture-slide-salon.jpg",
    headline: "Conduis, filme et vis l'action en temps réel sur écran couleur intégré !",
    bundles: [
      { name: "Voiture Télécommandée avec Caméra HD & Écran", price: 29900 }
    ]
  },
  {
    id: "masseur-oculaire-default",
    title: "Masque de Massage Oculaire Thérapeutique 4D Chauffant & Bluetooth",
    shortTitle: "Masque Oculaire Thérapeutique 4D",
    slug: "masseur-oculaire",
    price: 24900,
    image_url: "/images/masseur-oculaire-hero.jpg",
    image: "/images/masseur-oculaire-hero.jpg",
    bundles: [
      { name: "1x Masque de Massage Oculaire Thérapeutique 4D", price: 24900 },
      { name: "2x Masques de Massage Oculaire (Pack Duo Réduction)", price: 44900 }
    ]
  },
  {
    id: "microscope-default",
    title: "Microscope Numérique Portable HD 1000X",
    shortTitle: "Microscope Numérique HD 1000X",
    slug: "microscope",
    price: 22750,
    image_url: "/images/microscope-video-cover.webp",
    image: "/images/microscope-video-cover.webp",
    bundles: [
      { name: "Microscope Numérique Portable HD 1000X", price: 22750 }
    ]
  },
  {
    id: "equilibre-feminin-default",
    title: "Gummies Probiotiques Équilibre Féminin & Confort Intime (60 Gummies)",
    shortTitle: "Gummies Probiotiques Équilibre Féminin",
    slug: "equilibre-feminin",
    price: 14900,
    image_url: "/images/probiotic-gummies-hero-1.jpg",
    image: "/images/probiotic-gummies-hero-1.jpg",
    bundles: [
      { name: "Gummies Probiotiques Équilibre Féminin & Confort Intime", price: 14900 }
    ]
  },
  {
    id: "umei-default",
    title: "Brosse Multifonction Spray & Massage du Cuir Chevelu YUFAN™",
    shortTitle: "Brosse Spray & Massage YUFAN",
    slug: "umei",
    price: 14900,
    image_url: "/images/brosse-spray-hero.jpg",
    image: "/images/brosse-spray-hero.jpg",
    bundles: [
      { name: "Brosse Multifonction Spray & Massage YUFAN™", price: 14900 }
    ]
  },
  {
    id: "eraclean-default",
    title: "Purificateur d'Air & Anti-Odeurs EraClean™",
    shortTitle: "Purificateur EraClean™",
    slug: "eraclean",
    price: 19900,
    image_url: "/images/trozk-glow.jpg",
    image: "/images/trozk-glow.jpg",
    bundles: [
      { name: "Purificateur d'Air & Anti-Odeurs EraClean™", price: 19900 }
    ]
  },
  {
    id: "turbofan-default",
    title: "Ventilateur Ceinture & Powerbank TurboFan™ Max",
    shortTitle: "Ventilateur TurboFan™ Max",
    slug: "turbofan",
    price: 16900,
    image_url: "/images/brosse-spray-infographie.jpg",
    image: "/images/brosse-spray-infographie.jpg",
    bundles: [
      { name: "Ventilateur TurboFan™ Max 8000mAh", price: 16900 }
    ]
  },
  {
    id: "peeler-default",
    title: "Mandoline & Essoreuse Coupe-Légumes Multifonction (Duo Cuisine Malin)",
    shortTitle: "Mandoline & Duo Cuisine Malin",
    slug: "peeler",
    price: 17900,
    image_url: "/images/mandoline-hero-avant-apres.jpg",
    image: "/images/mandoline-hero-avant-apres.jpg",
    bundles: [
      { name: "Pack Duo Cuisine Malin (Mandoline + Plateau Conservation)", price: 17900 },
      { name: "Mandoline Essoreuse Seule", price: 14900 }
    ]
  },
  {
    id: "stabilisateur-default",
    title: "Stabilisateur Pro-Mobile Z3 Zoom™",
    shortTitle: "Stabilisateur Z3 Zoom™",
    slug: "stabilisateur",
    price: 49900,
    image_url: "/images/stabilisateur-hero.jpg",
    image: "/images/stabilisateur-hero.jpg",
    bundles: [
      { name: "Stabilisateur Pro-Mobile Z3 Zoom™", price: 49900 }
    ]
  },
  {
    id: "veilleuse-default",
    title: "Veilleuse Projecteur LED 3D Tactile FRIOSZ FP-032",
    shortTitle: "Veilleuse Projecteur FRIOSZ",
    slug: "veilleuse",
    price: 14900,
    image_url: "/images/tiktok-slide-5.webp",
    image: "/images/tiktok-slide-5.webp",
    bundles: [
      { name: "Veilleuse Projecteur LED 3D Tactile FRIOSZ", price: 14900 }
    ]
  },
  {
    id: "camera-default",
    title: "Mini Caméra Espionne & Surveillance Magnétique HD A9 Pro™",
    shortTitle: "Mini Caméra Espionne HD A9 Pro",
    slug: "camera",
    price: 16900,
    image_url: "/images/camera-hero.jpg",
    image: "/images/camera-hero.jpg",
    bundles: [
      { name: "Mini Caméra Espionne & Surveillance HD A9 Pro", price: 16900 }
    ]
  },
  {
    id: "trozk-default",
    title: "Batterie Modulaire 3-en-1 Trozk T3 Cyberpunk™ (15 000 mAh)",
    shortTitle: "Station de Charge Trozk T3",
    slug: "trozk",
    price: 29900,
    image_url: "/images/trozk-hero.jpg",
    image: "/images/trozk-hero.jpg",
    bundles: [
      { name: "Batterie Modulaire 3-en-1 Trozk T3 (15 000 mAh)", price: 29900 }
    ]
  },
  {
    id: "mini-lave-linge-default",
    title: "Mini Lave-Linge Stérilisateur Portable & Antibactérien",
    shortTitle: "Mini Lave-Linge Stérilisateur",
    slug: "mini-lave-linge",
    price: 17900,
    image_url: "/images/mini-lave-linge-hero.jpg",
    image: "/images/mini-lave-linge-hero.jpg",
    bundles: [
      { name: "Mini Lave-Linge Stérilisateur Portable & Antibactérien", price: 17900 }
    ]
  },
  {
    id: "matelas-default",
    title: "Matelas Gonflable Ergonomique Autogonflant avec Pompe & Oreiller Intégrés",
    shortTitle: "Matelas Autogonflant Ergonomique",
    slug: "matelas",
    price: 24900,
    image_url: "/images/matelas-hero.png",
    image: "/images/matelas-hero.png",
    bundles: [
      { name: "Matelas Gonflable Ergonomique Autogonflant + Pompe & Oreiller", price: 24900 }
    ]
  },
  {
    id: "savon-repousse-default",
    title: "Savon Shampoing Solide Purifiant & Anti-Chute aux Feuilles de Biota & Usma",
    shortTitle: "Savon Purifiant Feuilles de Biota",
    slug: "savon-repousse",
    price: 10750,
    image_url: "/images/savon-repousse/savon-slide-1.jpg",
    image: "/images/savon-repousse/savon-slide-1.jpg",
    headline: "De beaux cheveux commencent par un cuir chevelu sain. 100% Naturel.",
    bundles: [
      { name: "Savon Shampoing Solide Feuilles de Biota & Usma", price: 10750 }
    ]
  },
  {
    id: "sourire-eclatant-default",
    title: "Routine Sourire Éclatant (Spray + Dentifrice V34)",
    shortTitle: "Routine Sourire Éclatant",
    slug: "sourire-eclatant",
    price: 11000,
    image_url: "/images/sourire-eclatant/offre-duo.png",
    image: "/images/sourire-eclatant/offre-duo.png",
    bundles: [
      { name: "Routine Sourire Éclatant (Spray + Dentifrice)", price: 11000 }
    ]
  },
  {
    id: "projecteur-noel-default",
    title: "Lampe Projecteur de Noël Féerique USB Orientable 360° (6+ Motifs Magiques)",
    shortTitle: "Projecteur de Noël USB 360°",
    slug: "projecteur-noel",
    price: 16900,
    image_url: "/images/projecteur-noel/hero-famille.jpg",
    image: "/images/projecteur-noel/hero-famille.jpg",
    headline: "Transformez votre chambre et salon en un conte de fées féerique de Noël en un clin d'œil !",
    bundles: [
      { name: "Lampe Projecteur de Noël Féerique USB 360° (Coffret Complet)", price: 16900 }
    ]
  },
  {
    id: "bracelet-main-default",
    title: "Bracelet-Bague de Main Éclat Doré & Cristaux Scintillants (Baciamano Chic)",
    shortTitle: "Bracelet-Bague Éclat Doré",
    slug: "bracelet-main",
    price: 12750,
    image_url: "/images/bracelet-main/bracelet-hero.jpg",
    image: "/images/bracelet-main/bracelet-hero.jpg",
    headline: "Une tenue simple... et tout change ! Le bijou de main raffiné qui sublime votre allure.",
    bundles: [
      { name: "Bracelet-Bague de Main Éclat Doré & Cristaux Scintillants", price: 12750 }
    ]
  },
  {
    id: "stylo-3d-default",
    title: "Kit Complet Stylo 3D Professionnel 3DPEN-2 (12 Couleurs PLA 36m)",
    shortTitle: "Kit Stylo 3D Créatif 3DPEN-2",
    slug: "stylo-3d",
    price: 14900,
    image_url: "/images/stylo-3d/stylo-3d-kit.jpg",
    image: "/images/stylo-3d/stylo-3d-kit.jpg",
    headline: "Dessinez dans les airs et donnez vie à vos idées en 3D ! Kit complet éducatif et sécurisé.",
    bundles: [
      { name: "Kit Complet Stylo 3D 3DPEN-2 + 12 Recharges Filaments (36m)", price: 14900 }
    ]
  },
  {
    id: "carte-du-monde-default",
    title: "Carte du Monde à Gratter Deluxe Grand Format (82 x 59 cm) + Tube Cadeau & Accessoires",
    shortTitle: "Carte du Monde à Gratter Deluxe",
    slug: "carte-du-monde",
    price: 14900,
    image_url: "/images/carte-du-monde/carte-monde-deco.jpg",
    image: "/images/carte-du-monde/carte-monde-deco.jpg",
    headline: "Grattez où vous êtes allé et donnez vie à vos souvenirs de voyage sur une carte géante de luxe !",
    bundles: [
      { name: "Coffret Carte du Monde à Gratter Deluxe (82x59cm) + Tube & Accessoires", price: 14900 }
    ]
  },
  {
    id: "capsacare-default",
    title: "Crème Anti-Douleur Articulaire & Musculaire CapsaCare™ (Tube 100g)",
    shortTitle: "Crème Soulagement Douleurs CapsaCare™",
    slug: "capsacare",
    price: 14900,
    image_url: "/images/capsacare/capsacare-hero.jpg",
    image: "/images/capsacare/capsacare-hero.jpg",
    headline: "Soulagement rapide et ciblé des douleurs musculaires et articulaires : formule naturelle aux extraits de Capsaïcine, Menthol, Arnica, MSM et Glucosamine.",
    bundles: [
      { name: "Tube Officiel CapsaCare™ 100g Formule Complète Douleurs", price: 14900 }
    ]
  },
  {
    id: "odoraway-default",
    title: "Crème Déodorante Aisselles OdorAway™ (Boîte de 24 Sachets)",
    shortTitle: "Crème Déodorante OdorAway™",
    slug: "odoraway",
    price: 14900,
    image_url: "/images/odoraway/odoraway-hero.jpg",
    image: "/images/odoraway/odoraway-hero.jpg",
    headline: "Des aisselles fraîches, nettes et sans mauvaises odeurs toute la journée : formule botanique naturelle en sachets individuels nomades.",
    bundles: [
      { name: "Boîte Officielle OdorAway™ 24 Sachets Individuels", price: 14900 }
    ]
  },
  {
    id: "pare-soleil-default",
    title: "Pare-Soleil Anti-\u00c9blouissement 2-en-1 Jour/Nuit (Vision Claire HD)",
    shortTitle: "Pare-Soleil Anti-\u00c9blouissement 2-en-1",
    slug: "pare-soleil",
    price: 14900,
    image_url: "/images/pare-soleil/pare-soleil-reel.jpg",
    image: "/images/pare-soleil/pare-soleil-reel.jpg",
    headline: "Conduisez sans aucune gêne, de jour comme de nuit. \u00c9cran jaune contre le soleil, \u00e9cran fum\u00e9 contre les phares : deux protections dans un seul accessoire.",
    bundles: [
      { name: "Pare-Soleil Anti-\u00c9blouissement 2-en-1 Jour/Nuit + Clip Universel", price: 14900 }
    ]
  },
  {
    id: "shilajit-default",
    title: "Gummies Shilajit Gold Pur Himalaya 3000mg & Ashwagandha KSM-66 (60 Gummies)",
    shortTitle: "Gummies Shilajit Gold Himalaya",
    slug: "shilajit",
    price: 14900,
    image_url: "/images/shilajit/shilajit-hero.jpg",
    image: "/images/shilajit/shilajit-hero.jpg",
    headline: "Vitalité masculine et endurance au quotidien : formule sacrée de l'Himalaya au Shilajit Gold 3000 mg, Ashwagandha KSM-66, Black Musli et Gokshura en gummies savoureux.",
    bundles: [
      { name: "Gummies Shilajit Gold Pur Himalaya 3000mg & Ashwagandha KSM-66 (Boîte 60 Gummies)", price: 14900 }
    ]
  },
  {
    id: "filtre-eau-default",
    title: "Filtre à Eau Universel pour Robinet 6 Couches de Filtration",
    shortTitle: "Filtre à Eau Robinet 6 Couches",
    slug: "filtre-eau",
    price: 14900,
    image_url: "/images/filtre-eau/filtre-eau-hero.jpg",
    image: "/images/filtre-eau/filtre-eau-hero.jpg",
    headline: "Profitez d'une eau plus propre directement sur votre robinet : système 6 couches au charbon actif, billes minérales et résine filtrante avec collier de fixation universel.",
    bundles: [
      { name: "Filtre à Eau Universel pour Robinet 6 Couches de Filtration", price: 14900 }
    ]
  }
];

export const DEFAULT_CATALOG_MAP: Record<string, CatalogProduct> = DEFAULT_CATALOG.reduce((acc, p) => {
  acc[p.slug] = p;
  return acc;
}, {} as Record<string, CatalogProduct>);

export function getAdminDashboardProducts() {
  return DEFAULT_CATALOG.map(p => ({
    title: p.title,
    slug: p.slug,
    price: p.price,
    image: p.image_url
  }));
}

export function getOrderModalCatalog(): Record<string, { title: string; price: number }> {
  return DEFAULT_CATALOG.reduce((acc, p) => {
    acc[p.slug] = {
      title: p.title,
      price: p.price
    };
    return acc;
  }, {} as Record<string, { title: string; price: number }>);
}

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
  accentColor?: string;
  keywords?: string[];
  bundles: ProductBundle[];
}

export const DEFAULT_CATALOG: CatalogProduct[] = [
  {
    id: "moustiquaire-porte-default",
    title: "Moustiquaire de Porte Magnétique Automatique™ - Fermeture Aimantée Mains Libres (Sans Perçage)",
    shortTitle: "Moustiquaire de Porte Magnétique",
    slug: "moustiquaire-porte",
    price: 16900,
    accentColor: "#16A34A",
    keywords: [
      "moustiquaire",
      "moustique",
      "moustiquaire porte",
      "moustiquaire magnetique",
      "porte magnetique",
      "paludisme",
      "aimant",
      "velcro",
      "mains libres",
      "air frais",
      "moustiquaire aimantee",
      "insectes",
    ],
    image_url: "/images/moustiquaire-porte/hero-moustiquaire-porte-magnetique.jpg",
    image: "/images/moustiquaire-porte/hero-moustiquaire-porte-magnetique.jpg",
    headline: "Profitez de l'air frais tout en bloquant 100% des moustiques et insectes : fermeture magnétique automatique, passage mains libres et installation sans perçage en 5 minutes.",
    bundles: [
      { name: "Pack Intégral Moustiquaire de Porte Magnétique™ (Rideau Maille Renforcée + Bande Velcro + Aimants)", price: 16900 }
    ]
  },
  {
    id: "r36s-default",
    title: "Console de Jeux Portable R36S™ - Écran IPS 3.5\" HD + 64 Go (+15 000 Jeux Rétro)",
    shortTitle: "Console Portable R36S",
    slug: "r36s",
    price: 34900,
    accentColor: "#2563EB",
    keywords: [
      "r36s",
      "console portable",
      "console r36s",
      "console de jeux",
      "retro gaming",
      "jeux retro",
      "mario",
      "pokemon",
      "ps1",
      "psp",
      "gameboy",
      "64go",
      "cadeau enfant",
      "r36",
    ],
    image_url: "/images/r36s/hero-r36s-console-portable.jpg",
    image: "/images/r36s/hero-r36s-console-portable.jpg",
    headline: "Emportez des milliers de jeux rétro cultes dans votre poche avec écran IPS haute définition 3.5 pouces, 64 Go de stockage et batterie longue durée sans aucun abonnement.",
    bundles: [
      { name: "Pack Intégral Console Portable R36S™ (Console R36S + Carte 64 Go 15 000+ Jeux)", price: 34900 }
    ]
  },
  {
    id: "game-stick-4k-default",
    title: "Game Stick 4K Pro™ - Console Rétro HDMI Plug & Play + 2 Manettes Sans Fil (+10 000 Jeux)",
    shortTitle: "Game Stick 4K Pro",
    slug: "game-stick-4k",
    price: 22900,
    accentColor: "#DC2626",
    keywords: [
      "game stick",
      "gamestick",
      "game stick 4k",
      "console",
      "jeux video",
      "jeux vidéo",
      "manette",
      "retro",
      "mario",
      "playstation",
      "hdmi",
      "cadeau enfant",
      "2 manettes",
      "console de jeux",
    ],
    image_url: "/images/game-stick/hero-game-stick-4k-pro.jpg",
    image: "/images/game-stick/hero-game-stick-4k-pro.jpg",
    headline: "Transformez votre téléviseur en console de jeux avec plus de 10 000 jeux rétro intégrés, 2 manettes sans fil et résolution 4K sans aucun abonnement.",
    bundles: [
      { name: "Pack Intégral Game Stick 4K Pro™ (Stick HDMI + 2 Manettes Sans Fil + 10 000+ Jeux)", price: 22900 }
    ]
  },
  {
    id: "the-5-tresors-default",
    title: "Tisane des Cinq Trésors™ - Ginseng & Racine de Maca Pure (30 Sachets)",
    shortTitle: "Tisane des 5 Trésors 150g",
    slug: "the-5-tresors",
    price: 12900,
    accentColor: "#991B1B",
    keywords: [
      "the",
      "tisane",
      "cinq tresors",
      "5 tresors",
      "the 5 tresors",
      "tisane des cinq tresors",
      "ginseng",
      "maca",
      "goji",
      "vitalite",
      "endurance",
      "energie",
      "reins",
      "fatigue",
    ],
    image_url: "/images/the-5-tresors/hero-performance-masculine.jpg",
    image: "/images/the-5-tresors/hero-performance-masculine.jpg",
    headline: "Infusion naturelle aux 5 plantes ancestrales (Ginseng, Maca, Goji, Dattes rouges, Mûres) pour une vitalité et une endurance durables au quotidien.",
    bundles: [
      { name: "Tisane des Cinq Trésors™ (Boîte 30 Sachets - Cure 30 jours)", price: 12900 }
    ]
  },
  {
    id: "likel-rite-default",
    title: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)",
    shortTitle: "Diffuseur d'Arômes LIKEL RITE™ 500 ml",
    slug: "likel-rite",
    price: 14900,
    accentColor: "#B45309",
    keywords: [
      "likel",
      "likel rite",
      "likel-rite",
      "diffuseur",
      "diffuseur d'arome",
      "diffuseur d'arômes",
      "humidificateur",
      "parfum d'interieur",
      "parfum interieur",
      "500 ml",
      "500ml",
    ],
    image_url: "/images/likel-rite/hero-clean.jpg",
    image: "/images/likel-rite/hero-clean.jpg",
    headline: "Même chambre, autre ambiance : diffuseur d'arômes ultrasonique 500 ml design flacon de parfum avec veilleuse cristal 3 tons.",
    bundles: [
      { name: "Diffuseur d'Arômes & Veilleuse Cristal LIKEL RITE™ (500 ml)", price: 14900 }
    ]
  },
  {
    id: "calendrier-3d-default",
    title: "Calendrier Perpétuel Décoratif 3D Magnétique",
    shortTitle: "Calendrier Décoratif 3D",
    slug: "calendrier-3d",
    price: 24900,
    accentColor: "#D97706",
    keywords: ["calendrier", "perpetuel", "perpétuel", "calendrier 3d", "moma"],
    image_url: "/images/calendrier-3d/calendrier-3d-hero-colors.jpg",
    image: "/images/calendrier-3d/calendrier-3d-hero-colors.jpg",
    headline: "Un objet sculptural unique alliant décoration moderne et mécanisme perpétuel magnétique utilisable toute la vie.",
    bundles: [
      { name: "Calendrier Perpétuel Décoratif 3D Magnétique", price: 24900 }
    ]
  },
  {
    id: "digestigum-default",
    title: "DigestiGum™ - Gummies Enzymes Digestives + Probiotiques + Prébiotiques",
    shortTitle: "DigestiGum™ Gummies Digestifs",
    slug: "digestigum",
    price: 14900,
    accentColor: "#059669",
    keywords: ["digestigum", "digestion", "ballonnement", "ventre plat", "enzymes"],
    image_url: "/images/digestigum/digestigum-hero-60-gummies.jpg",
    image: "/images/digestigum/digestigum-hero-60-gummies.jpg",
    headline: "60 gummies Plant-Based 3-en-1 pour un ventre serein, une digestion légère et une flore intestinale équilibrée au quotidien.",
    bundles: [
      { name: "DigestiGum™ - Gummies Enzymes Digestives + Probiotiques + Prébiotiques (60 gummies)", price: 14900 }
    ]
  },
  {
    id: "trousse-biometrique-default",
    title: "Trousse de Voyage Cuir Luxe avec Verrouillage Biométrique par Empreinte",
    shortTitle: "Trousse Cuir Biométrique",
    slug: "trousse-biometrique",
    price: 24900,
    accentColor: "#1E293B",
    keywords: ["trousse", "biometrique", "biométrique", "empreinte", "pochette cuir", "sacoche cuir"],
    image_url: "/images/trousse-biometrique/trousse-hero-protection.jpg",
    image: "/images/trousse-biometrique/trousse-hero-protection.jpg",
    headline: "Cuir grainé imperméable et cadenas intelligent à reconnaissance d'empreinte digitale pour sécuriser et organiser tous vos essentiels.",
    bundles: [
      { name: "Trousse de Voyage Cuir Luxe avec Verrouillage Biométrique", price: 24900 }
    ]
  },
  {
    id: "cubicraft-default",
    title: "CubiCraft™ - Coffret Blocs Magnétiques de Construction",
    shortTitle: "CubiCraft Blocs Magnétiques",
    slug: "cubicraft",
    price: 16900,
    accentColor: "#16A34A",
    keywords: ["cubicraft", "cubi-craft", "minecraft", "blocs magnetiques", "blocs magnétiques", "cubes"],
    image_url: "/images/pixelblocks/coffret-cadeau.jpg",
    image: "/images/pixelblocks/coffret-cadeau.jpg",
    headline: "Des cubes magnétiques réalistes pour créer, inventer et stimuler la créativité sans écran.",
    bundles: [
      { name: "CubiCraft™ - Coffret Blocs Magnétiques de Construction", price: 16900 }
    ]
  },
  {
    id: "duo-bracelets-coeur-default",
    title: "Coffret Cadeau Écrin Duo de Bracelets Cœurs Dorés Ajustables",
    shortTitle: "Duo Bracelets Cœurs Dorés",
    slug: "duo-bracelets-coeur",
    price: 14900,
    accentColor: "#B45309",
    keywords: ["duo bracelet", "bracelets coeur", "couple", "aimant"],
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
    accentColor: "#DC2626",
    keywords: ["voiture", "telecommandee", "télécommandée", "c6", "voiture camera", "voiture caméra"],
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
    accentColor: "#4F46E5",
    keywords: ["masseur", "oculaire", "yeux", "migraine"],
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
    accentColor: "#4F46E5",
    keywords: ["microscope", "loupe"],
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
    accentColor: "#E11D48",
    keywords: ["probiotique", "intime", "equilibre feminin", "équilibre féminin", "femme"],
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
    accentColor: "#FF5C93",
    keywords: ["brosse", "yufan", "umei", "spray", "brume", "cheveux", "demelage", "démêlage"],
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
    accentColor: "#2563EB",
    keywords: ["eraclean", "desodorisant", "désodorisant", "frigo", "refrigerateur"],
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
    accentColor: "#059669",
    keywords: ["turbofan", "ventilateur", "souffleur", "turbine"],
    image_url: "/images/brosse-spray-infographie.jpg",
    image: "/images/brosse-spray-infographie.jpg",
    bundles: [
      { name: "Ventilateur TurboFan™ Max 8000mAh", price: 16900 }
    ]
  },
  {
    id: "masseur-vibrant-default",
    title: "Masseur Vibrant Portable 2-en-1 avec Sangle Mains Libres (Abdomen, Dos & Corps)",
    shortTitle: "Masseur Vibrant 2-en-1",
    slug: "masseur-vibrant",
    price: 16900,
    accentColor: "#7C3AED",
    keywords: [
      "masseur",
      "masseur vibrant",
      "massage",
      "abdomen",
      "dos",
      "ventre",
      "sangle",
      "mains libres",
      "relaxation",
      "tensions",
      "courbatures",
      "muscles",
      "bien-être",
    ],
    image_url: "/images/masseur-vibrant/carousel-1-hero.jpg",
    image: "/images/masseur-vibrant/carousel-1-hero.jpg",
    headline: "Soulagez vos tensions et détendez vos muscles en 15 minutes : masseur vibrant portable 2-en-1 (mode manuel ou sangle mains libres), 5 intensités, écran LED et batterie 1200 mAh.",
    bundles: [
      { name: "Coffret Masseur Vibrant Portable 2-en-1 + Sangle 140cm + Câble Type-C", price: 16900 }
    ]
  },
  {
    id: "peeler-default",
    title: "Mandoline & Essoreuse Coupe-Légumes Multifonction (Duo Cuisine Malin)",
    shortTitle: "Mandoline & Duo Cuisine Malin",
    slug: "peeler",
    price: 17900,
    accentColor: "#059669",
    keywords: ["mandoline", "peeler", "coupe-legumes", "coupe légumes", "eplucheur", "éplucheur"],
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
    accentColor: "#D97706",
    keywords: ["stabilisateur", "gimbal", "trepied", "trépied", "selfie"],
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
    accentColor: "#4F46E5",
    keywords: ["veilleuse", "lampe", "méduse", "meduse", "deco"],
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
    accentColor: "#059669",
    keywords: ["camera", "caméra", "surveillance", "wifi"],
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
    accentColor: "#F97316",
    keywords: ["trozk", "multiprise", "chargeur", "station de charge"],
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
    accentColor: "#0284C7",
    keywords: ["lave-linge", "lave linge", "machine a laver", "pliable"],
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
    accentColor: "#0D9488",
    keywords: ["matelas", "gonflable", "camping"],
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
    accentColor: "#15803D",
    keywords: ["savon", "usma", "biota", "repousse", "alopecie", "chute de cheveux"],
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
    accentColor: "#7C3AED",
    keywords: ["dentifrice", "sourire", "blanchiment", "dents", "violet"],
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
    accentColor: "#DC2626",
    keywords: ["projecteur", "noel", "noël"],
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
    accentColor: "#B45309",
    keywords: ["bracelet bague", "chaine de main", "chaîne de main", "bijou main"],
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
    price: 16900,
    accentColor: "#2563EB",
    keywords: ["stylo 3d", "stylo-3d", "3d pen", "impression 3d", "stylo magique"],
    image_url: "/images/stylo-3d/stylo-3d-kit.jpg",
    image: "/images/stylo-3d/stylo-3d-kit.jpg",
    headline: "Dessinez dans les airs et donnez vie à vos idées en 3D ! Kit complet éducatif et sécurisé.",
    bundles: [
      { name: "Kit Complet Stylo 3D 3DPEN-2 + 12 Recharges Filaments (36m)", price: 16900 }
    ]
  },
  {
    id: "carte-du-monde-default",
    title: "Carte du Monde à Gratter Deluxe Grand Format (82 x 59 cm) + Tube Cadeau & Accessoires",
    shortTitle: "Carte du Monde à Gratter Deluxe",
    slug: "carte-du-monde",
    price: 14900,
    accentColor: "#B45309",
    keywords: ["carte du monde", "carte a gratter", "carte à gratter", "scratch map"],
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
    accentColor: "#EA580C",
    keywords: ["capsacare", "capsa", "douleur", "articulaire", "genou", "dos", "arthrose"],
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
    accentColor: "#0D9488",
    keywords: ["odoraway", "odor", "deodorant", "déodorant", "aisselles", "transpiration"],
    image_url: "/images/odoraway/odoraway-hero.jpg",
    image: "/images/odoraway/odoraway-hero.jpg",
    headline: "Des aisselles fraîches, nettes et sans mauvaises odeurs toute la journée : formule botanique naturelle en sachets individuels nomades.",
    bundles: [
      { name: "Boîte Officielle OdorAway™ 24 Sachets Individuels", price: 14900 }
    ]
  },
  {
    id: "pare-soleil-default",
    title: "Pare-Soleil Anti-Éblouissement 2-en-1 Jour/Nuit (Vision Claire HD)",
    shortTitle: "Pare-Soleil Anti-Éblouissement 2-en-1",
    slug: "pare-soleil",
    price: 14900,
    accentColor: "#D97706",
    keywords: ["pare-soleil", "pare soleil", "eblouissement", "éblouissement", "visiere", "visière", "pare-brise"],
    image_url: "/images/pare-soleil/pare-soleil-reel.jpg",
    image: "/images/pare-soleil/pare-soleil-reel.jpg",
    headline: "Conduisez sans aucune gêne, de jour comme de nuit. Écran jaune contre le soleil, écran fumé contre les phares : deux protections dans un seul accessoire.",
    bundles: [
      { name: "Pare-Soleil Anti-Éblouissement 2-en-1 Jour/Nuit + Clip Universel", price: 14900 }
    ]
  },
  {
    id: "shilajit-default",
    title: "Gummies Shilajit Gold Pur Himalaya 3000mg & Ashwagandha KSM-66 (60 Gummies)",
    shortTitle: "Gummies Shilajit Gold Himalaya",
    slug: "shilajit",
    price: 14900,
    accentColor: "#B45309",
    keywords: ["shilajit", "himalaya", "gummies shilajit", "energie", "vitalite"],
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
    accentColor: "#0284C7",
    keywords: ["filtre", "purificateur", "robinet", "eau potable", "calcaire"],
    image_url: "/images/filtre-eau/filtre-eau-hero.jpg",
    image: "/images/filtre-eau/filtre-eau-hero.jpg",
    headline: "Profitez d'une eau plus propre directement sur votre robinet : système 6 couches au charbon actif, billes minérales et résine filtrante avec collier de fixation universel.",
    bundles: [
      { name: "Filtre à Eau Universel pour Robinet 6 Couches de Filtration", price: 14900 }
    ]
  },
  {
    id: "starlight-chargeur-default",
    title: "Chargeur Voiture Rétractable 5-en-1 Starlight™ avec Diffuseur & Projection Ciel Étoilé",
    shortTitle: "Chargeur Starlight 5-en-1",
    slug: "starlight-chargeur",
    price: 16900,
    accentColor: "#D97706",
    keywords: [
      "starlight",
      "chargeur",
      "chargeur voiture",
      "chargeur auto",
      "chargeur retractable",
      "chargeur rétractable",
      "cables retractables",
      "câbles rétractables",
      "yango",
      "vtc",
      "ciel etoile",
      "ciel étoilé",
      "arome",
      "arôme",
      "parfum voiture",
      "laser auto",
    ],
    image_url: "/images/chargeur-retractable/visuel_coffret_starlight_reel.jpg",
    image: "/images/chargeur-retractable/visuel_coffret_starlight_reel.jpg",
    headline: "Câbles rétractables ultrarapides, diffuseur de parfum d'ambiance avec 3 flacons inclus, anneau cristal RGB et projection laser ciel étoilé dans un seul boîtier rotatif 180°.",
    bundles: [
      { name: "Coffret Officiel Chargeur 5-en-1 Starlight™ + 3 Arômes Inclus", price: 16900 }
    ]
  },
  {
    id: "chargeur-retractable-alias",
    title: "Chargeur Voiture Rétractable 5-en-1 Starlight™",
    shortTitle: "Chargeur Starlight 5-en-1",
    slug: "chargeur-retractable",
    price: 16900,
    accentColor: "#D97706",
    keywords: ["chargeur-retractable", "chargeur retractable", "chargeur voiture"],
    image_url: "/images/chargeur-retractable/visuel_coffret_starlight_reel.jpg",
    image: "/images/chargeur-retractable/visuel_coffret_starlight_reel.jpg",
    headline: "Câbles rétractables ultrarapides, diffuseur de parfum d'ambiance avec 3 flacons inclus, anneau cristal RGB et projection laser ciel étoilé.",
    bundles: [
      { name: "Coffret Officiel Chargeur 5-en-1 Starlight™ + 3 Arômes Inclus", price: 16900 }
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
